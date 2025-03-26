import axios from 'axios' ;
import { showAlert } from './alerts' ;
export const login = async (email, password) => {
    try{
        const member = await axios({
            method: 'POST',
            url: '/api/v1/auth/login',
            data: {
                email,
                password
            }
        });
        if(member.data.status ==='success'){
            showAlert('success', 'Logged in successfully!','.login-container')
            window.setTimeout(() => {
                location.assign('/')
            },1500);   
        }
    }catch(error){
        if(error.response && error.response.status === 401){
            showAlert('danger', 'Invalid email or password','.login-container')
        }else{
            showAlert('danger', 'Something went wrong','.login-container')
        }
    }
};

// logout
export const logout = async () => {
    try{
        const member = await axios({
            method: 'GET',
            url: '/api/v1/auth/logout'
        });
        if(member.data.status ==='success'){
            window.setTimeout(() => {
                location.reload(true);
            },1500);   
        }
    }catch(error){
        console.error(error);
    }
}

//register

export const register = async (memberData) => {
    try{
        const member = await axios({
            method: 'POST',
            url: '/api/v1/auth/signup',
            data: memberData
        });
        if(member.data.status ==='success'){
            showAlert('success', 'Registered successfully!','.register-container')
            window.setTimeout(() => {
                location.assign('/login')
            },1500);   
        }
    }catch(error){
        if(error.response && error.response.status === 400){
            showAlert('danger', error.response.data.message,'.register-container')
        }else{
            showAlert('danger', 'Something went wrong','.register-container')
        }
    }
};