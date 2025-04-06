import { login,logout,register } from './login.js';
import { sendInvitation } from './memberAndInvitations.js';
import { acceptInvitation,declineInvitation,declineInvitationFromInvitationsPage,acceptInvitationFromInvitationsPage,updateProfile } from './memberAndInvitations.js';
import { addNormalTicket,addComposedTicket } from './ticketClient.js';
import { changeAssignee,editNormalTicket,deleteTicketNormal,doneTicket,editComposedTicket,deleteTicketCompose } from './ticketClient.js';
import { addProject} from './projectClient.js';
import { ticketSocket } from './sockets/ticketClientSocket.js';
import{ invitationSocket } from './sockets/invitationClientSocket.js';


const loginForm = document?.querySelector('.login-form');
const emailFilter = document?.getElementById('email-filter');
const declineButton = document?.getElementById('decline-button');
const acceptButton = document?.getElementById('accept-button');
const addNormalTicketForm = document?.getElementById('normal-ticket-form');
const addComposedTicketForm = document?.getElementById('composed-ticket-form');
var index = 0;
const ticketsDiv = document?.getElementById("tickets-data");
const composedTicketsDiv = document?.getElementById("composed-tickets");
const memberInvitationContainer = document?.getElementById("memberInvitationContainer");
const settingsForm = document?.getElementById('settingsForm');
const changePasswordForm = document?.getElementById('changePasswordForm');
const logoutButton = document?.getElementById('logout-button');
const registerForm = document?.getElementById('registerForm');
const curProjectForm = document?.getElementById('curProjectForm');

/**
scrum board translations 
*/

const scrumBoardContainer = document?.getElementById('scrumBoardContainer');
if (scrumBoardContainer) {
    const statuses = ["Todo","Doing","Done"];
    statuses.forEach(state=> {
        new Sortable(document.getElementById(state),{
            group:"shared",
            animation: 150,
            onEnd: function (evt) {
                const ticketId= evt.item.dataset.ticketid;
                const newStatus = evt.to.id;
                const projectId = document.querySelector('.project-page').dataset.project; // Assurez-vous que cet élément existe
                fetch(`/api/v1/normal-tickets/${ticketId}`,{
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        state: newStatus
                    })
                }).then(res => res.json()).then(data => {
                      // Utiliser le socket pour mettre à jour le statut
                      console.log('data = ',data)
                        ticketSocket.emit('update-normal-ticket', data.data.data);
                    if(data.data.data.state == 'Done')
                        location.reload(true);
                });
            }
        });
    });
}
/**
 * change assingee ticket 
 */
const changeAssigneeDoing = document.querySelectorAll('.changeAssigneeDoing');
const changeAssigneeToDo = document.querySelectorAll('.changeAssigneeToDo');
if (changeAssigneeDoing) {
    changeAssigneeDoing.forEach(elem => {
        elem.addEventListener('click', async (e) => {
            e.preventDefault();
            const ticketId = elem.dataset.ticket;
            const assignee = elem.dataset.assignee;
            await changeAssignee(ticketId, assignee);
        });
    });
}
if (changeAssigneeToDo) {
    changeAssigneeToDo.forEach(elem => {
        elem.addEventListener('click', async (e) => {
            e.preventDefault();
            const ticketId = elem.dataset.ticket;
            const assignee = elem.dataset.assignee;
            await changeAssignee(ticketId, assignee);
        });
    });
}

/**
 * end of change assingee ticket 
 */


/**
 * ajouter un projet 
 */

const addProjectForm = document.getElementById('addProjectForm');
if (addProjectForm) {
    addProjectForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const project = {
            name: document.getElementById('projectName').value,
            description: document.getElementById('projectDescription').value,
            startAt: new Date(document.getElementById('projectStartAt').value),
            endAt: new Date(document.getElementById('projectEndAt').value),
            chef: document.getElementById('chef').value            
        }
        await addProject(project);
    });
}

/**
 * end ajouter projet
 */

var allMemberFiltred = [];
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        login(email, password);
    });
}

if (emailFilter) {
    emailFilter.addEventListener('input',(e) =>{
        e.preventDefault();
        handleFilter();
    } );
}

const handleFilter = () => {
    const email = document.getElementById('email-filter').value;
    let allMembers = document.getElementById('all-members').dataset.appmembers;
    allMembers = JSON.parse(allMembers);
    if (!email) {
        allMemberFiltred = allMembers;
        renderFilteredMembers(); // Appeler la fonction pour mettre à jour l'affichage
        return;
    }
    allMemberFiltred = allMembers.filter(member => member.email.includes(email) && member.email.charAt(email) === email.charAt(member.email));
    renderFilteredMembers(); // Appeler la fonction pour mettre à jour l'affichage
};

//rendering filtred members by email input in invitation pour un affichage dynamique
const renderFilteredMembers = () => {
    const membersList = document.querySelector('.members-list');
    membersList.innerHTML = ''; // Vider la liste actuelle
    allMemberFiltred.forEach(member => {
        const listItemHTML = `
            <li class="list-group-item d-flex">
                <img src="/img/members/${member.avatar}" class="rounded-circle mt-1" width="40" height="40" />
                <div class="d-block">
                    <p class="mb-0 ms-3"><strong>${member.name}</strong></p>
                    <p class="mb-0 ms-3"><small>${member.email}</small></p>
                </div>
                <button data-name="${member.name}" data-id="${member.id}" data-email="${member.email}" class="invitation-btn btn btn-light text-dark fw-semibold ms-auto" >send Invitation</button>
            </li>
        `;
        membersList.insertAdjacentHTML('beforeend', listItemHTML);
    });
    const invitationBtns = document.querySelectorAll('.invitation-btn');
    if(invitationBtns) {
        invitationBtns.forEach(button => {
            button.addEventListener('click', async (e) => {
                e.preventDefault();
                const projectId = document.getElementById('project-id').value;
                const projectName = document.getElementById('project-name').value;
                const email = e.target.dataset.email;
                const memberId = e.target.dataset.id;
                const memberName = e.target.dataset.name;
                const invitation = await sendInvitation({ email: email, name: memberName, id: memberId }, projectId, projectName);
                // use socket to emit the invitation to conserned member
                console.log('invitation = ',invitation)
                invitationSocket.emit('send-invitation', {invitation});

            });
        });
    }
};

// décliner une invitation

if (declineButton) {
    declineButton.addEventListener('click',async (e) => {
        e.preventDefault();
        const invitationId = document.getElementById('idInvitation').value;
        await declineInvitation(invitationId);
    });
}

// accepter une invitation

if (acceptButton) {
    acceptButton.addEventListener('click',async (e) => {
        e.preventDefault();
        const invitationId = document.getElementById('idInvitation').value;
        await acceptInvitation(invitationId);
    });
}

//ajouter normal ticket

if (addNormalTicketForm) {
    addNormalTicketForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const normalTicket = {
            title: document.getElementById('title').value,
            description:  document.getElementById('description').value,
            priority: document.getElementById('priority').value,
            project:  document.getElementById('project').value,
            dueDate: document.getElementById('dueDate').value,
            assignee: document.getElementById('assignee').value
        }
        const ticket = await addNormalTicket(normalTicket);
        ticketSocket.emit('add-normal-ticket', ticket);
    });
}

//ajouter ticket composé
if(document?.getElementById('addSubTicket'))
    document.getElementById('addSubTicket').addEventListener('click', function() {
        index++;
        const titreId = `sub-titre-${index}`
        const descriptionId = `sub-description-${index}`;
        const priorityId = `sub-priority-${index}`;
        const dueDateId = `sub-dueDate-${index}`;
        const subTicketForm = `
        <div class="sub-ticket-form border p-3 mb-3">
            <div class="form-group">
            <label for="subTitle">Titre du sous-ticket</label>
            <input id="${titreId}" type="text" class="form-control" required>
            </div>
            <div class="form-group">
            <label for="subDescription">Description</label>
            <textarea class="form-control" id="${descriptionId}"  rows="2" required></textarea>
            </div>
            <div class="form-group">
            <label for="subPriority">Priorité</label>
            <select class="form-control" id="${priorityId}" >
                <option value="low">Basse</option>
                <option value="medium" selected>Moyenne</option>
                <option value="high">Haute</option>
            </select>
            </div>
            <div class="form-group">
            <label for="subDueDate">Date Limite</label>
            <input id="${dueDateId}" type="date" class="form-control"  required>
            </div>
            <button type="button" class="btn btn-danger mt-2 removeSubTicket">Supprimer</button>
        </div>
        `;
        document.getElementById('subTicketsContainer').insertAdjacentHTML('beforeend', subTicketForm);
    });

if( document?.getElementById('subTicketsContainer'))
  document.getElementById('subTicketsContainer').addEventListener('click', function(e) {
    if (e.target.classList.contains('removeSubTicket')) {
      e.target.closest('.sub-ticket-form').remove();
      

    }
  });  

if (addComposedTicketForm) {
    addComposedTicketForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('====================================');
        console.log("index =",index);
        console.log('====================================');
        const subTickets = [];
        for(let i = 0; i < index; i++) {
            const subTicket = {
                title: document?.getElementById(`sub-titre-${i+1}`).value,
                description: document?.getElementById(`sub-description-${i+1}`).value,
                priority: document?.getElementById(`sub-priority-${i+1}`).value,
                assignee: document?.getElementById('assignee').value,
                project:  document.getElementById('project').value,
                dueDate: document?.getElementById(`sub-dueDate-${i+1}`).value
            }
            subTickets.push(subTicket);
        }
        const composedTicket = {
            title: document.getElementById('title-composed').value,
            description:  document.getElementById('description-composed').value,
            project:  document.getElementById('project').value,
            assignee: document.getElementById('assignee').value,
            subTickets: subTickets
        }
        const ticket = await addComposedTicket(composedTicket);
        ticketSocket.emit('add-composed-ticket', ticket);
    });
}

/**
* modifier un ticket normal , change state ...
*/
if(ticketsDiv){
    const tickets = JSON.parse(ticketsDiv.dataset.tickets);
    const ticketsIds = tickets.map(ticket => ticket._id);
    ticketsIds.forEach(async (ticketId) => {
        const editTicketForm = document?.getElementById(`edit-normal-ticket-form${ticketId}`);
        const deleteTicketButton = document?.getElementById(`deleteButton${ticketId}`);
        const endButton = document?.getElementById(`endButton${ticketId}`);
        /**
            edit normal ticket form
        */
        if(editTicketForm){
            editTicketForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const ticket = {
                    title: document?.getElementById(`title${ticketId}`).value,
                    description: document?.getElementById(`description${ticketId}`).value,
                    priority: document?.getElementById(`priority${ticketId}`).value,
                    dueDate: document?.getElementById(`dueDate${ticketId}`).value,
                    project:  document.getElementById(`project${ticketId}`).value,
                    state: document?.getElementById(`state${ticketId}`)?.value
                }
                await editNormalTicket(ticketId, ticket);
            });
        }
        /**
            end of edit normal ticket form
        */


        /**
            supprimer une ticket normal
        */
        if(deleteTicketButton){
            deleteTicketButton.addEventListener('click', async (e) => {
                e.preventDefault();
                 await deleteTicketNormal(ticketId);
                const ticket = tickets.find(ticket => ticket._id === ticketId);
                ticketSocket.emit('delete-normal-ticket', {ticketId: ticket.id, project: ticket.project});
            });
        }
        /**
            end of supprimer une ticket normal
        */
        /**
            finir une ticket normal
        */   
        if(endButton){
            endButton.addEventListener('click', async (e) => {
                e.preventDefault();
                await doneTicket(ticketId,{ state: 'Done'  });
            });
        }
        /**
            end of finir une ticket normal
        */

    
    })
}

/**
* modifier un ticket composite, change state...
*/
if(composedTicketsDiv){
    const composedTickets = JSON.parse(composedTicketsDiv.dataset.tickets);
    const composedTicketsIds = composedTickets.map(ticket => ticket._id);
    composedTicketsIds.forEach(async (ticketId) => {
        const editComposedTicketForm = document?.getElementById(`edit-composed-ticket-form${ticketId}`);
        const deleteTicketButton = document?.getElementById(`deleteComposedTicketButton${ticketId}`);
        const endButton = document?.getElementById(`endButton${ticketId}`);
        const subTickets = composedTickets.find(ticket => ticket._id === ticketId).subTickets;
        const subTicketsIds = subTickets.map(subTicket => subTicket._id);
        /**
        modifier un ticket composite
        */
        if(editComposedTicketForm){
            editComposedTicketForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const ticket = {
                    title: document?.getElementById(`title${ticketId}`).value,
                    description: document?.getElementById(`description${ticketId}`).value,
                    project:  document.getElementById(`project${ticketId}`).value,
                    assignee: document?.getElementById(`assignee${ticketId}`).value,
                    state: document?.getElementById(`state${ticketId}`)?.value
                }
                await editComposedTicket(ticketId, ticket);
            });
        }
        /**
        end of modifier un ticket composite
        */
        /**
        supprimer une ticket composite
        */
        if(deleteTicketButton){
            deleteTicketButton.addEventListener('click', async (e) => {
                e.preventDefault();
                await deleteTicketCompose(ticketId);
                //integrate socket to remove the ticket from the project
                const composedTicket = composedTickets.find(ticket => ticket._id === ticketId);
                ticketSocket.emit('delete-composed-ticket', {ticketId: composedTicket.id, project: composedTicket.project});
            });
        }
        /**
        end of supprimer une ticket composite
        */
    });

}

/**
* accepter une invitation ou refuser là
*/

if(memberInvitationContainer){
    const memberInvitations = JSON.parse(memberInvitationContainer.dataset.invitations);
    const memberInvitationsIds = memberInvitations.map(invitation => invitation._id);
    memberInvitationsIds.forEach(async (invitationId) => {
        const acceptButton = document?.getElementById(`accepterBtn${invitationId}`);
        const declineButton = document?.getElementById(`refuserBtn${invitationId}`);
        if(acceptButton){
            acceptButton.addEventListener('click', async (e) => {
                e.preventDefault();
                await acceptInvitationFromInvitationsPage(invitationId);
            });
        }
        if(declineButton){
            declineButton.addEventListener('click', async (e) => {
                e.preventDefault();
                await declineInvitationFromInvitationsPage(invitationId);
            });
        }
    });
}


/**
    modifier profile  de l'utilisateur courant
*/

if(settingsForm){
    settingsForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = new FormData();
        form.append('name', document.getElementById('name').value);
        form.append('email', document.getElementById('email').value);
        form.append('addresse',document.getElementById('addresse').value);
        form.append('phone', document.getElementById('phone').value);
        form.append('avatar', document.getElementById('avatar').files[0]);
        await updateProfile(form,'data');
    });
}



/**
    modifier mot de passe de l'utilisateur courant
*/

if(changePasswordForm){
    changePasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        document.querySelector('.btn-save-password').textContent = 'Updating ...';
        const passwordCurrent = document.getElementById('currentPassword').value;
        const password = document.getElementById('newPassword').value;
        const passwordConfirm = document.getElementById('confirmPassword').value;
        await updateProfile({passwordCurrent,password,passwordConfirm},'password');
        document.querySelector('.btn-save-password').textContent = 'Modifier le mot de passe';
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
    });
}

/**
logout de l'utilisateur
*/

if(logoutButton){
    logoutButton.addEventListener('click', async (e) => {
        e.preventDefault();
        await logout();
    });
}

/**
    enregistrer un nouveau membre
*/

if(registerForm){
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const member = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            addresse: document.getElementById('addresse').value,
            password: document.getElementById('password').value,
            role: document.getElementById('role').value,
            passwordConfirm: document.getElementById('passwordConfirm').value
        }
        console.log('====================================');
        console.log(member);
        console.log('====================================');
        await register(member);
    });
}

/**
 * socket handling pour ticket 
 */
// Rejoindre un projet
if (document?.querySelector('.project-page')) {
    const {project} = document.querySelector('.project-page').dataset;
    ticketSocket.emit('join-project', { projectId: project });
}
/**
 * socket handling pour invitation
 */
if(document?.querySelector('.member-page')){
    const {member} = document.querySelector('.member-page').dataset;
    invitationSocket.emit('add-member', { memberId: member });
}


/**
 * when switch from project to project re-use socket
 */
if(curProjectForm){
    curProjectForm.addEventListener('submit', (e) => {
        const {project} = document.querySelector('.project-page').dataset;
        ticketSocket.emit('join-project', { projectId: project });
        const {member} = document.querySelector('.member-page').dataset;
        invitationSocket.emit('add-member', { memberId: member });

        // Optionnel : Si vous voulez effectuer une action après l'émission du socket
        // mais avant que la page ne se recharge, vous pouvez utiliser setTimeout
        setTimeout(() => {
            // Cette fonction sera exécutée juste après que l'événement soit émis
            console.log('Switched to project:', project);
        }, 0);

        // Le formulaire sera soumis normalement, ce qui rechargera probablement la page
    });
}







