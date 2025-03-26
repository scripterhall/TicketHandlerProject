import axios from 'axios' ;
import { showAlert} from './alerts' ;
export const sendInvitation = async (member,projectId,projectName) => {
    try{
        const invitation = await axios({
            method: 'POST',
            url: `/api/v1/projects/${projectId}/invitations`,
            data: {
                email: member.email,
                member: member.id,
                project: projectId,
                messageInvitation: `Bonjours Mr ${member.name} , Vous êtes invité a rejoindre notre projet ${projectName}!`
            },
            withCredentials: true  
        });
        if(invitation.data.status === 'success'){
             showAlert('success','Invitation envoyé avec succès!','.result-message');
             window.setTimeout(() => {
                 location.reload();
             }, 1300);
        } else {
            showAlert('danger','Erreur lors de l\'envoi de l\'invitation, veuillez réessayer plus tard.','.result-message');
        }
    }catch(error){
        if(error.response && error.response.status === 401){
            showAlert('danger','error sending invitation try again later !','.result-message') 
        }else{
            showAlert('danger','Something went wrong','.result-message')
        }
    }
};

// using axios to accept invitation 

export const acceptInvitation = async (invitationId) => {
    try{
        axios.defaults.baseURL = 'http://localhost:7000';
        const invitation = await axios({
            method: 'PATCH',
            url: `api/v1/invitations/${invitationId}/accept`,
            withCredentials: true  
        });
        if(invitation.data.status === 'success'){
             showAlert('success','vous avez accepter l\'invitation','.result-message');
             window.setTimeout(() => {
                 location.assign('/login');
             }, 1500);
        } else {
            showAlert('danger','Erreur lors de l\'acceptation de l\'invitation, veuillez réessayer plus tard.','.result-message');
        }
    }catch(error){
        if(error.response && error.response.status === 401){
            showAlert('danger','error accepting invitation try again later !','.result-message') 
        }else{
            showAlert('danger','Something went wrong','.result-message')
        }
    }
}

// using axios to decline invitation

export const declineInvitation = async (invitationId) => {
    try{
        axios.defaults.baseURL = 'http://localhost:7000';
        const invitation = await axios({
            method: 'PATCH',
            url: `api/v1/invitations/${invitationId}/decline`,
            withCredentials: true  
        });
        if(invitation.data.status === 'success'){
             showAlert('success','vous avez refuser l\'invitation','.result-message');
             window.setTimeout(() => {
                 location.assign('/login');
             }, 1500);
        } else {
            showAlert('danger','Erreur lors de l\'refus de l\'invitation, veuillez réessayer plus tard.','.result-message');
        }
    }catch(error){
        if(error.response && error.response.status === 401){
            showAlert('danger','error declining invitation try again later !','.result-message') 
        }else{
            showAlert('danger','Something went wrong','.result-message')
        }
    }

}

export const acceptInvitationFromInvitationsPage = async (invitationId) => {
    try{
        axios.defaults.baseURL = 'http://localhost:7000';
        const invitation = await axios({
            method: 'PATCH',
            url: `api/v1/invitations/${invitationId}/accept`,
            withCredentials: true  
        });
        if(invitation.data.status === 'success'){
            //showAlert('success','vous avez accepter l\'invitation','invitation-modal-body'+invitationId);
             window.setTimeout(() => {
                 location.reload();
             }, 1500);
        } else {
            //showAlert('danger','Erreur lors de l\'acceptation de l\'invitation, veuillez réessayer plus tard.','invitation-modal-body'+invitationId);
        }
    }catch(error){
        console.log(error);
        
    }
}

export const declineInvitationFromInvitationsPage = async (invitationId) => {
    try{
        axios.defaults.baseURL = 'http://localhost:7000';
        const invitation = await axios({
            method: 'PATCH',
            url: `api/v1/invitations/${invitationId}/decline`,
            withCredentials: true  
        });
        if(invitation.data.status === 'success'){
            //showAlert('success','vous avez refuser l\'invitation','invitation-modal-body'+invitationId);
             window.setTimeout(() => {
                location.reload();
             }, 1500);
        } else {
            //showAlert('danger','Erreur lors de l\'refus de l\'invitation, veuillez réessayer plus tard.','invitation-modal-body'+invitationId);
        }
    }catch(error){
        console.log(error);
    }

}


export const updateProfile = async (data , type) => {
    const url = type === 'password'? '/api/v1/members/update-password' : '/api/v1/members/me';
    try{
        axios.defaults.baseURL = 'http://localhost:7000';
        const response = await axios({
            method: 'PATCH',
            url,
            data,
            withCredentials: true
        });
        if(response.data.status ==='success'){
            showAlert('success','Profile est mis à jours!','.result-message');
            window.setTimeout(() => {
                location.reload(true);
            }, 1500);
        }else{
            showAlert('danger','Erreur lors de la mise à jour du profile, veuillez réessayer plus tard.','.result-message');
        }
    }catch(error){
        console.log(error);
    }
}




