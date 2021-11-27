import React, { Fragment, useEffect } from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {Link} from 'react-router-dom';
import {getCurrentProfile} from '../../actions/profile';
import DashboardActions from './DashboardActions';
import Experience from './Experience';
import Education from './Education';
import {deleteAccount} from '../../actions/profile'


const Dashboad = ({getCurrentProfile, auth, profile: {profile, loading}, deleteAccount}) => {
    useEffect(() => {
        getCurrentProfile();
    },[getCurrentProfile]);

    return loading && profile === null ? (<Fragment>Loading....</Fragment>) : (
        <Fragment>
            <h1 className="large text-primary">Dashboard</h1>
            <p className="lead">
                Welcome {auth.user && auth.user.name}
            </p>
            {profile !== null ? 
            <Fragment>
                <DashboardActions />
                <Experience experience={profile.experience} />
                <Education education={profile.education} />
                <div className="my-2">
                    <button onClick={() => deleteAccount()} className="btn btn-danger">
                        <i className="fas fa-user-minus"></i>

                        Delete My Account
                    </button>
                </div>
            </Fragment> : 
            <Fragment>
                You have not yet created a profile, please add some information!
                <Link to='/create-profile' className="btn btn-primary">Create Profile</Link>
            </Fragment> }
        </Fragment>
    )
}

Dashboad.propTypes = {
    getCurrentProfile: PropTypes.func.isRequired,
    auth: PropTypes.object.isRequired,
    profile: PropTypes.object.isRequired,
    deleteAccount: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
    auth: state.auth,
    profile: state.profile
});

export default connect(mapStateToProps, {getCurrentProfile, deleteAccount}) (Dashboad);
