import sqlite3
import string
import random
import os
from flask import *
from flask_cors import CORS

app = Flask(__name__, static_folder='build', static_url_path='/')
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
app.config['TEMPLATES_AUTO_RELOAD'] = True

# CORS Cross-Origin
CORS(app, resources={r"/api/*": {"origins": "*"}})

# run the project

@app.route('/')
def serve():
    return send_from_directory(app.static_folder, 'index.html')

# make sure all react routes redirect to the index.html
@app.route('/<path:path>')
def catch_all(path):
    # print("PATH: ", path)
    # Check if the path starts with 'dashboard'
    if path.startswith('dashboard'):
        # Check if user is authenticated
        api_key = request.cookies.get('xiat_api_key')
        user = query_db('select * from users where api_key = ?', (api_key,), one=True)
        
        # If the user is not authenticated, redirect to home page
        if not api_key or not user:
            return redirect('/')

    # Existing logic for serving static files or index.html
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')
    

# Database

def get_db():
    db = getattr(g, '_database', None)

    if db is None:
        db = g._database = sqlite3.connect('db/belay.sqlite3')
        db.execute('PRAGMA foreign_keys = ON;')
        db.row_factory = sqlite3.Row
        setattr(g, '_database', db)
    return db

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

def query_db(query, args=(), one=False):
    db = get_db()
    cursor = db.execute(query, args)
    rows = cursor.fetchall()
    db.commit()
    cursor.close()
    if rows:
        if one: 
            return rows[0]
        return rows
    return None

# helper function
def new_user(username, password):
    api_key = ''.join(random.choices(string.ascii_lowercase + string.digits, k=40))
    u = query_db('insert into users (name, password, api_key) ' + 
        'values (?, ?, ?) returning id, name, password, api_key',
        (username, password, api_key),
        one=True)
    return u

def api_key_auth(func):
    def wrapper_func(*args, **kwargs):
        api_key = request.cookies.get('xiat_api_key')
        if not api_key:
            return jsonify({'error': 'API_KEY not found'}), 401
        user = query_db('select * from users where api_key = ?', (api_key,), one=True)
        if not user:
            return jsonify({'error': 'Invalid API_KEY'}), 401
        
        return func(*args, **kwargs)
    wrapper_func.__name__ = func.__name__
    return wrapper_func

# API Routes

# user authentication
@app.route('/api/verify_auth', methods = ['GET'])
@api_key_auth
def authentication():
    # if @api_key_auth not return error it means that the request is valid
    return jsonify({'authentication':'success'}), 200

# signup/login/logout

@app.route('/api/signup', methods = ['POST'])
def signup():
    # print("Hey! I got your request!")
    # print(f"Received request on URL: {request.url}")
    # get the json data
    data = request.get_json()
    # check data integrity
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'error': 'Missing data'}), 400
    
    username = data.get('username')
    password = data.get('password')

    user = new_user(username, password)

    # create the last message for new user in each channel
    channels = query_db('select * from channels')
    # if there are some channels now
    if channels:
        for channel in channels:
            # starting from 0 means that the new user has not seen any messages yet
            query_db('insert into last_read_messages (user_id, channel_id) values (?, ?)', (user['id'], channel['id']))

    resp = make_response("signup response", 201)
    resp.set_cookie('xiat_api_key', user['api_key'])
    return resp

@app.route('/api/login', methods = ['POST'])
def login():
    # get the json data
    data = request.get_json()
    # check data integrity
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'error': 'Missing data'}), 400
    
    username = data.get('username')
    password = data.get('password')

    # check in the user table
    user = query_db('select * from users where name = ? and password = ?', (username, password), one=True)
    if not user:
        # the user is not in our database
        return jsonify({'error': 'Invalid username or password'}), 401
    
    resp = make_response("login response", 200)
    resp.set_cookie('xiat_api_key', user['api_key'])
    return resp

@app.route('/api/logout', methods = ['POST'])
@api_key_auth
def logout():
    resp = make_response("logout response", 200)
    resp.set_cookie('xiat_api_key', '', expires=0)
    return resp

# user profile
@app.route('/api/user', methods = ['GET'])
@api_key_auth
def user():
    api_key = request.cookies.get('xiat_api_key')
    user = query_db('select * from users where api_key = ?', (api_key,), one=True)
    return jsonify({'user_id': user['id'], 'username': user['name']}), 200

@app.route('/api/user/username/update', methods = ['PUT'])
@api_key_auth
def update_username():
    api_key = request.cookies.get('xiat_api_key')
    user = query_db('select * from users where api_key = ?', (api_key,), one=True)
    # get the json data
    data = request.get_json()
    # check data integrity
    if not data or not data.get('username'):
        return jsonify({'error': 'Missing data'}), 400
    new_username = data.get('username')
    query_db('update users set name = ? where id = ?', (new_username, user['id']))
    return jsonify({'update': 'success'}), 200

@app.route('/api/user/password/update', methods = ['PUT'])
@api_key_auth
def update_password():
    api_key = request.cookies.get('xiat_api_key')
    user = query_db('select * from users where api_key = ?', (api_key,), one=True)
    # get the json data
    data = request.get_json()
    # check data integrity
    if not data or not data.get('password'):
        return jsonify({'error': 'Missing data'}), 400
    new_password = data.get('password')
    query_db('update users set password = ? where id = ?', (new_password, user['id']))
    return jsonify({'update': 'success'}), 200

# channels

@app.route('/api/channels/create', methods = ['POST'])
@api_key_auth
def create_channel():
    # get the json data
    data = request.get_json()
    # check data integrity
    if not data or not data.get('channel_name'):
        return jsonify({'error': 'Missing data'}), 400
    channel_name = data.get('channel_name')
    all_channel_names = query_db('select name from channels')

    # check if channel_name has been in the records
    if all_channel_names:
        name_exists = any(name[0] == channel_name for name in all_channel_names)
        if name_exists:
            return jsonify({'error': 'duplication'}), 400

    query_db('insert into channels (name) values (?)', (channel_name,))

    # update the user last read message
    channel = query_db('select * from channels where name = ?', (channel_name, ), one=True)
    users = query_db('select * from users')
    # require api_key it must have registered users
    for user in users:
        # print("userID: ", user['id'])
        # print("channelID: ", channel['id'])
        query_db('insert into last_read_messages (user_id, channel_id) values (?, ?)', (user['id'], channel['id']))

    return jsonify(dict(channel)), 201

@app.route('/api/channels/all', methods = ['GET'])
@api_key_auth
def get_channels():
    channels = query_db('select * from channels')
    # if there are not channels
    if not channels:
        return jsonify([]), 200
    # Sort the channels by creation time order
    channels.sort(key=lambda channel : channel['id'], reverse=True)
    return jsonify([dict(channel) for channel in channels]), 200

@app.route('/api/channels/<int:channel_id>', methods = ['GET'])
@api_key_auth
def get_channel(channel_id):
    channel = query_db('select * from channels where id = ?', (channel_id,), one=True)
    if not channel:
        return jsonify({'error': 'The channel does not exist'}), 404
    return jsonify(dict(channel)), 200

@app.route('/api/channels/<int:channel_id>/delete', methods = ['POST'])
@api_key_auth
def delete_channel(channel_id):
    query_db('delete from channels where id = ?', (channel_id,))
    return jsonify({'delete':'success'}), 200

@app.route('/api/channels/<int:channel_id>/messages', methods = ['GET'])
@api_key_auth
def get_messages(channel_id):
    messages = query_db('select * from messages where channel_id = ? and reply_to IS NULL', (channel_id,))
    if not messages:
        # there is not messages yet
        return jsonify([]), 200
    # the newer message has larger ID
    messages.sort(key=lambda message : message['id'], reverse=True)
    messages = [dict(msg) for msg in messages]
    # handle the users who replied this message
    for message in messages:
        user = query_db('select * from users where id = ?', (message['user_id'],), one=True)
        message['username'] = user['name']
        # print("username in message: ", message['username'])

        reply_count = query_db('select count(*) from messages where reply_to = ?', (message['id'],), one=True)
        # if no one reply this message
        if not reply_count:
            message['reply_count'] = 0
        message['reply_count'] = reply_count[0]
        # print("reply count to this message: ", message['reply_count'])

    return jsonify([dict(message) for message in messages]), 200

@app.route('/api/channels/<int:channel_id>/messages/post', methods = ['POST'])
@api_key_auth
def post_message(channel_id):
    api_key = request.cookies.get('xiat_api_key')
    user = query_db('select * from users where api_key = ?', (api_key, ), one=True)
    # get the json data
    data = request.get_json()
    # check data integrity
    if not data or not data.get('message'):
        return jsonify({'error': 'Missing data'}), 400
    body = data.get('message')
    query_db('insert into messages (user_id, channel_id, body) values (?, ?, ?)', (user['id'], channel_id, body))
    return jsonify({'post':'success'}), 201

@app.route('/api/channels/<int:channel_id>/update', methods = ['PUT'])
@api_key_auth
def update_channel_name(channel_id):
    # get the json data
    data = request.get_json()
    # check data integrity
    if not data or not data.get('channelName'):
        return jsonify({'error': 'Missing data'}), 400
    new_channel_name = data.get('channelName');
    query_db('update channels set name = ? where id = ?', (new_channel_name, channel_id))
    return jsonify({'update': 'success'}), 200

# messages

@app.route('/api/messages/<int:message_id>', methods = ['GET'])
@api_key_auth
def get_message(message_id):
    message = query_db('select * from messages where id = ?', (message_id,), one=True)
    if not message:
        return jsonify({'error':'The message does not exist'}), 404
    message = dict(message)
    user = query_db('select * from users where id = ?', (message['user_id'],), one=True)
    message['username'] = user['name']
    return jsonify(dict(message)), 200

@app.route('/api/messages/<int:message_id>/reply', methods = ['POST'])
@api_key_auth
def reply_message(message_id):
    api_key = request.cookies.get('xiat_api_key')
    user = query_db('select * from users where api_key = ?', (api_key, ), one=True)
    message = query_db('select * from messages where id = ?', (message_id, ), one=True)
    channel_id = message['channel_id']
    # get the json data
    data = request.get_json()
    # check data integrity
    if not data or not data.get('message'):
        return jsonify({'error': 'Missing data'}), 400
    body = data.get('message')
    query_db('insert into messages (user_id, channel_id, body, reply_to) values (?, ?, ?, ?)', (user['id'], channel_id, body, message_id))
    return jsonify({"reply":"success"}), 201

@app.route('/api/messages/<int:message_id>/replies', methods = ['GET'])
@api_key_auth
def get_replies(message_id):
    replies = query_db('select * from messages where reply_to = ?', (message_id, ))
    if not replies:
        # there are no replies for this message
        return jsonify([]), 200
    # sort by the time the message was sent
    replies.sort(key = lambda message : message['id'], reverse=True)
    replies = [dict(reply) for reply in replies]

    for reply in replies:
        user = query_db('select * from users where id = ?', (reply['user_id'],), one=True)
        reply['username'] = user['name']
    
    return jsonify([dict(reply) for reply in replies]), 200

@app.route('/api/messages/<int:message_id>/reactions/add', methods = ['POST'])
@api_key_auth
def leave_reaction(message_id):
    api_key = request.cookies.get('xiat_api_key')
    user = query_db('select * from users where api_key = ?', (api_key, ), one=True)
    # get the json data
    data = request.get_json()
    # check data integrity
    if not data or not data.get('emoji'):
        return jsonify({'error': 'Missing data'}), 400
    emoji = data.get('emoji')
    print("Emoji: ", emoji)
    try:
        query_db('insert into reactions (message_id, user_id, emoji) values (?, ?, ?)', (message_id, user['id'], emoji))
    except:
        query_db('delete from reactions where user_id = ? and message_id = ? and emoji = ?', (user['id'], message_id, emoji))

    return jsonify({'add':'success'}), 201

@app.route('/api/messages/<int:message_id>/reactions', methods = ['GET'])
@api_key_auth
def get_reactions(message_id):
    reactions_data = query_db('select emoji, count(*) as count, group_concat(user_id) as users from reactions where message_id = ? group by emoji', (message_id, ))
    if not reactions_data:
        # there are no reactions for this message
        return jsonify([]), 200
    
    reactions = []
    for reaction in reactions_data:
        users_id = reaction['users'].split(',')
        users = query_db('select name from users where id in ({})'.format(','.join('?' for _ in users_id)), users_id)
        usernames = [user['name'] for user in users]
        reactions.append({
            'emoji': reaction['emoji'],
            'count': reaction['count'],
            'users': usernames
        })
    
    return jsonify(reactions), 200
    
# last read

@app.route('/api/channels/<int:channel_id>/last_read/update', methods=['POST'])
@api_key_auth
def update_last_read(channel_id):
    api_key = request.cookies.get('xiat_api_key')
    user = query_db('select * from users where api_key = ?', (api_key, ), one=True)
    if not user:
        return jsonify({'error': 'user not found'}), 404
    user_id = user['id']
   
    # find the latest message ID
    latest_message_id = query_db('select id from messages where channel_id = ? order by id DESC limit 1', (channel_id, ), one=True)
    if latest_message_id:
        message_id = latest_message_id['id']
        # update the last_read_messages table
        query_db('insert into last_read_messages (user_id, channel_id, message_id) values (?, ?, ?) on conflict (user_id, channel_id) do update set message_id = ?', (user_id, channel_id, message_id, message_id))
        return jsonify({'update':'success'}), 200
    else:
        # There is no message in the channel yet
        return jsonify({'update':'No message'}), 200
    
    
    

# @app.route('/api/channels/<int:channel_id>/last_read', methods=['GET'])
# @api_key_auth
# def get_last_read(channel_id):
#     api_key = request.cookies.get('xiat_api_key')
#     user = query_db('select * from users where api_key = ?', (api_key, ), one=True)
#     if not user:
#         return jsonify({'error': 'user not found'}), 404
#     user_id = user['id']
#     last_read_message = query_db('select * from last_read_messages where user_id = ? and channel_id = ?', (user_id, channel_id), one=True)
#     return jsonify({'message_id': last_read_message['message_id']}), 200





@app.route('/api/channels/unread', methods=['GET'])
@api_key_auth
def get_unread_counts():
    api_key = request.cookies.get('xiat_api_key')
    user = query_db('select * from users where api_key = ?', (api_key, ), one=True)
    if not user:
        return jsonify({'error': 'user not found'}), 404
    user_id = user['id']
    counts_data = query_db(
        """
        select channel_id, count(*) as count 
        from messages 
        where id > (
            select COALESCE(
                (select message_id from last_read_messages where user_id = ? and channel_id = messages.channel_id), 0
            )
        ) and reply_to IS NULL 
        group by channel_id
        """, (user_id, ))

    unread_counts = []
    if counts_data:
        for data in counts_data:
            unread_counts.append({
                'channel_id': data['channel_id'],
                'unread_count': data['count']
            })
    
    return jsonify(unread_counts), 200




# @app.route('/api/channels/<int:channel_id>/unread', methods=['GET'])
# @api_key_auth
# def get_unread_count(channel_id):
#     api_key = request.cookies.get('xiat_api_key')
#     user = query_db('select * from users where api_key = ?', (api_key, ), one=True)
#     if not user:
#         return jsonify({'error': 'user not found'}), 404
#     user_id = user['id']
#     unread_count = query_db('select count(*) from messages where channel_id = ? and id > (select message_id from last_read_messages where user_id = ? and channel_id = ?)', (channel_id, user_id, channel_id), one=True)
#     return jsonify({'unread_count': unread_count[0]}), 200




if __name__ == '__main__':
    app.run(debug=True)