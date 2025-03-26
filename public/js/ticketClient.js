import axios from "axios";
import { showAlert } from "./alerts";

export const addNormalTicket = async (ticketData) => {
    try {
        axios.defaults.baseURL = "http://localhost:7000";
        const ticket = await axios({
            method: 'POST',
            url: '/api/v1/normal-tickets',
            data:ticketData
        });
        if(ticket.data.status ==='success'){
            showAlert('success', 'ticket ajouter avec success!','.modal-body')
            window.setTimeout(() => {
                location.assign(`/projects/${ticketData.project}/tickets`);
            },1500);   
        }
        showAlert("success", "Ticket créé avec succès", ".modal-body");
    } catch (error) {
        showAlert("danger", "Erreur lors de la création du ticket", ".ticket-form");
        console.error(error);
    }
};

export  const addComposedTicket = async(ticketData) => {
    try {
        axios.defaults.baseURL = "http://localhost:7000";
        // Insérer chaque sous-ticket individuellement et récupérer les IDs
        const subTicketResponses = await Promise.all(
            ticketData.subTickets.map(subTicket =>
                axios.post('/api/v1/normal-tickets', subTicket)
            )
        );
        // Mettre à jour ticketData.subTickets avec les IDs retournés
        ticketData.subTickets = subTicketResponses.map(response => {
            return response.data.data.data.id; 
        });
        // Insérer le ticket composé après l'insertion des sous-tickets
        const ticket = await axios({
            method: 'POST',
            url: '/api/v1/composed-tickets',
            data: ticketData
        });

        if (ticket.data.status === 'success') {
            showAlert('success', 'ticket ajouter avec success!', '.modal-body-composed');
            window.setTimeout(() => {
                location.assign(`/projects/${ticketData.project}/tickets`);
            }, 1500);
        }
        showAlert("success", "Ticket créé avec succès", ".modal-body-composed");
    } catch (error) {
        showAlert("danger", "Erreur lors de la création du ticket", ".modal-body-composed");
        console.error(error);
    }
}

export const changeAssignee = async (ticketId, assigneeId) => {
    try {
        
        axios.defaults.baseURL = "http://localhost:7000";
        await axios({
            method: 'PATCH',
            url: `/api/v1/tickets/${ticketId}`,
            data: { assignee:assigneeId }
        });
        showAlert('success', 'Assignéé modifié avec succès!', '.container');
    } catch (error) {
        showAlert('danger', 'Erreur lors de la modification de l\'assignéé', '.container');
        console.error(error);
    }
};

export const editNormalTicket = async (ticketId, updatedTicketData) => {
    try {
        axios.defaults.baseURL = "http://localhost:7000";
        const ticket = await axios({
            method: 'PATCH',
            url: `/api/v1/normal-tickets/${ticketId}`,
            data: updatedTicketData
        });
        if(ticket.data.status ==='success'){
            showAlert('success', 'ticket modifier avec success!',`.modal-body-${ticketId}`)
            window.setTimeout(() => {
                location.reload();
        },1800);   
        }
    } catch (error) {
        showAlert('danger', 'Erreur lors de la modification du ticket', `.modal-body-${ticketId}`);
        console.error(error);
    }
};


export const editComposedTicket = async (ticketId, updatedTicketData) => {
    try {
        axios.defaults.baseURL = "http://localhost:7000";
        const ticket = await axios({
            method: 'PATCH',
            url: `/api/v1/composed-tickets/${ticketId}`,
            data: updatedTicketData
        });
        if(ticket.data.status ==='success'){
            showAlert('success', 'ticket modifier avec success!',`.modal-body-${ticketId}`)
            window.setTimeout(() => {
                location.reload();
        },1800);   
        }
    } catch (error) {
        showAlert('danger', 'Erreur lors de la modification du ticket', `.modal-body-${ticketId}`);
        console.error(error);
    }
};

export const doneTicket = async (ticketId, updatedTicketData) => {
    try {
        axios.defaults.baseURL = "http://localhost:7000";
        const ticket = await axios({
            method: 'PATCH',
            url: `/api/v1/normal-tickets/${ticketId}`,
            data: updatedTicketData
        });
        if(ticket.data.status ==='success'){
            showAlert('success', 'Félicitation ,ticket terminé !',`.modal-body-end-${ticketId}`)
            window.setTimeout(() => {
                location.reload();
        },2100);   
        }
    } catch (error) {
        showAlert('danger', 'Erreur lors de la modification du ticket', `.modal-body-end-${ticketId}`);
        console.error(error);
    }
}

export const deleteTicketNormal = async (ticketId) => {
    try {
        axios.defaults.baseURL = "http://localhost:7000";
        const ticket = await axios({
            method: 'DELETE',
            url: `/api/v1/normal-tickets/${ticketId}`
        });
        if(ticket.status === 204){
            showAlert('success', 'ticket supprimer avec success!',`.modal-supprimer-body-${ticketId}`)
            window.setTimeout(() => {
                location.reload();
        },1000);   
        }
    } catch (error) {
        showAlert('danger', 'Erreur lors de la suppression du ticket', '.container');
        console.error(error);
    }

};

export const deleteTicketCompose = async (ticketId) => {
    try {
        axios.defaults.baseURL = "http://localhost:7000";
        const ticket = await axios({
            method: 'DELETE',
            url: `/api/v1/composed-tickets/${ticketId}`
        });
        if(ticket.status === 204){
            showAlert('success', 'ticket supprimer avec success!',`.modal-supprimer-body-${ticketId}`)
            window.setTimeout(() => {
                location.reload();
        },1800);   
        }
    } catch (error) {
        showAlert('danger', 'Erreur lors de la suppression du ticket', '.container');
        console.error(error);
    }

};