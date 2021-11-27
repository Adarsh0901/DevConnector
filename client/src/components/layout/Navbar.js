import React from 'react';
import { Link } from "react-router-dom";
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {logout} from '../../actions/auth';
import { Fragment } from 'react';

const Navbar = ({ auth: { isAuthenticated , loading}, logout }) => {

    const authLink = (
        <ul>
            <li><Link to="/profiles">Developers</Link></li>
            <li><Link to="/posts">Posts</Link></li>
            <li><Link to="/dashboard">DashBoard</Link></li>
            <li><Link to="/" onClick={logout}><i className="fas fa-sign-out-alt"></i>{' '}<span className="hide-sm">Logout</span></Link></li>
        </ul>
    )

    const guestLink = (
        <ul>
            <li><Link to="/profiles">Developers</Link></li>
            <li><Link to="register">Register</Link></li>
            <li><Link to="login">Login</Link></li>
        </ul>
    )

    return (
        <nav className="navbar bg-dark">
            <h1>
                <Link to="/"><i className="fas fa-code"></i> DevConnector</Link>
            </h1>
            {!loading && (<Fragment>{ isAuthenticated ? authLink : guestLink}</Fragment>)}
        </nav>
    )
};

Navbar.propTypes = {
    logout: PropTypes.func.isRequired,
    auth: PropTypes.object.isRequired
  };
  
  const mapStateToProps = (state) => ({
    auth: state.auth
  });
  
  export default connect(mapStateToProps, { logout })(Navbar);