import axios from 'axios';
import { showAlert } from './alerts';


//ajouter projet

export const addProject = async (projet) => {
    try{
        axios.defaults.baseURL = 'http://localhost:7000';
        const project = await axios({
            method: 'POST',
            url: `api/v1/projects`,
            data: projet,
            withCredentials: true  
        });
        if(project.data.status === 'success'){
             showAlert('success','projet ajouter avec succés','.modal-body');
             window.setTimeout(() => {
                 location.assign('/');
             }, 1500);
        } else {
            showAlert('danger','projet n\'est pas ajoutee, veuillez réessayer plus tard.','.result-message');
        }
    }catch(error){
        if(error.response && error.response.status === 401){
            showAlert('danger','error d\'authorization !','.result-message') 
        }else{
            showAlert('danger','Something went wrong','.result-message')
        }
    }
}