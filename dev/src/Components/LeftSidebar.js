/* eslint-disable jsx-a11y/anchor-is-valid */
const LeftSidebar = ({onProfileClick, onSignOutClick}) => {
    return (
    <div className="d-flex flex-column flex-shrink-0 bg-body-tertiary" style={{ width: '3.7rem', height: '100%' }}>
        <ul className="nav nav-pills nav-flush flex-column mb-auto text-center">
            <li>
                <a href="#" className="nav-link py-3 rounded-0" data-bs-toggle="tooltip" data-bs-placement="right" aria-label="Dashboard" data-bs-original-title="Dashboard">
                {/* <svg class="bi pe-none" width="24" height="24" role="img" aria-label="Dashboard"><use xlink:href="#speedometer2"></use></svg> */}
                <p>1</p>
                </a>
            </li>
        </ul>
        <div className="dropup border-top">
            <a href="#" className="d-flex align-items-center justify-content-center p-3 link-body-emphasis text-decoration-none dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" className="bi bi-person-circle" viewBox="0 0 16 16">
                    <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/>
                    <path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1"/>
                </svg>
            </a>
            <ul className="dropdown-menu text-small shadow">
                <li><a className="dropdown-item" href="#">New project...</a></li>
                <li><a className="dropdown-item" href="#">Settings</a></li>
                <li><a className="dropdown-item" href="#" onClick={(e) => {
                    // prevent default behavior
                    e.preventDefault();
                    onProfileClick();
                }}>Profile</a></li>
                <li><hr className="dropdown-divider"/></li>
                <li><a className="dropdown-item" href="#" onClick={(e) => {
                    e.preventDefault();
                    onSignOutClick();
                }}>Sign out</a></li>
            </ul>
        </div>
    </div>
    );
};

export default LeftSidebar;
