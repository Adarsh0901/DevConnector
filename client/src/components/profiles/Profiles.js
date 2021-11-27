import React,{Fragment, useEffect} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {getProfile} from '../../actions/profile';
import ProfileItem from './ProfileItem';

const Profiles = ({getProfile, profile: {profiles, loading}}) => {
    useEffect(() => {
        getProfile();
    },[getProfile]);
    return (
        <Fragment>
            {loading ? <h2>Loading....</h2> : <Fragment>
                <h1 class="large text-primary">Developers</h1>
                <p class="lead">
                    <i class="fab fa-connectdevelop"></i> Browse and connect with developers
                </p>
                <div class="profiles">
                    {profiles.length > 0 ? (
                        profiles.map(profile => (
                            <ProfileItem key={profile._id} profile={profile}/>
                        ))
                    ) : <h4>No profiles found .....</h4>}
                </div>
            </Fragment> }
        </Fragment>
    )
}

Profiles.propTypes = {
    getProfile: PropTypes.func.isRequired,
    profile: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
    profile: state.profile
});

export default connect(mapStateToProps, {getProfile}) (Profiles);
