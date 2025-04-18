import {io} from 'socket.io-client';
let globalChart; // Déclaration en dehors de la fonction

/**
 * socket ticket pour le namespace ticket dans la socket de backend
 */
const ticketSocket = io('/ticket');

// Gestion des événements de connexion
ticketSocket.on('connect', () => {
    console.log('Connected to ticket socket');
});


/**
 * Événements pour les tickets normaux
 * @new
 * @update 
 * @delete
 *  */ 

//new
ticketSocket.on('newNormalTicket', (ticket) => {
    console.log('New normal ticket received in client:', ticket);
    
    if(document?.getElementById('stats-data')){
        ajouterTicketViaSocket(ticket)
        const statsElement = document.getElementById('stats-data');
        let todo = parseFloat(statsElement.dataset.todo);
        let doing = parseFloat(statsElement.dataset.doing);
        let done = parseFloat(statsElement.dataset.done);

       // Calculez le nombre total de tickets actuel
       const totalPercentage = todo + doing + done;
       let totalTickets = 100 / totalPercentage;

       // Ajoutez le nouveau ticket
       totalTickets++;

       // Recalculez les pourcentages
       if (ticket.state === 'Todo') {
           todo = ((todo * (totalTickets - 1) / 100) + 1) / totalTickets * 100;
           doing = (doing * (totalTickets - 1) / 100) / totalTickets * 100;
           done = (done * (totalTickets - 1) / 100) / totalTickets * 100;
       } else if (ticket.state === 'Doing') {
           todo = (todo * (totalTickets - 1) / 100) / totalTickets * 100;
           doing = ((doing * (totalTickets - 1) / 100) + 1) / totalTickets * 100;
           done = (done * (totalTickets - 1) / 100) / totalTickets * 100;
       } else if (ticket.state === 'Done') {
           todo = (todo * (totalTickets - 1) / 100) / totalTickets * 100;
           doing = (doing * (totalTickets - 1) / 100) / totalTickets * 100;
           done = ((done * (totalTickets - 1) / 100) + 1) / totalTickets * 100;
       }

       const stats = {
           TODO: todo.toFixed(1),
           DOING: doing.toFixed(1),
           DONE: done.toFixed(1)
       };

       console.log('Stats:', stats);
       
        const data = {
          labels: ['TODO', 'DOING', 'DONE'],
          datasets: [{
            label: 'Répartition des tickets (%)',
            data: [stats.TODO, stats.DOING, stats.DONE],
            backgroundColor: [
              'rgba(220, 38, 38, 0.7)',   // TODO - $danger - #dc2626
              'rgba(245, 158, 11, 0.7)',  // DOING - $warning - #f59e0b
              'rgba(22, 163, 74, 0.7)'    // DONE - $success - #16a34a
            ],
            borderColor: [
              'rgba(220, 38, 38, 0.7)',
              'rgba(245, 158, 11, 0.7)',
              'rgba(22, 163, 74, 0.7)'
            ],
            borderWidth: 1
          }]
        };
      
        const config = {
          type: 'pie',
          data: data,
          options: {
            plugins: {
              tooltip: {
                callbacks: {
                  label: function(context) {
                    return `${context.label}: ${context.raw}%`;
                  }
                }
              }
            }
          }
        };
         // Utilisation
         const newChartElement = recreateElement('myPieChart');
         if (newChartElement) {
             globalChart = new Chart(newChartElement, config);
         }
          // Mettez à jour les données dans l'élément stats-data
            statsElement.dataset.todo = stats.TODO;
            statsElement.dataset.doing = stats.DOING;
            statsElement.dataset.done = stats.DONE;
            const h2Todo = document.getElementById('ticket-todo');
            const h2Doing = document.getElementById('ticket-doing');
            const h2Done = document.getElementById('ticket-done');
            h2Todo.innerHTML = stats.TODO + '%';
            h2Doing.innerHTML = stats.DOING + '%';
            h2Done.innerHTML = stats.DONE + '%';
            const h4NbrTicket = document.getElementById('h4NbrTicket');
            //recuperer le text de h4NbrTicket et incrementer
            h4NbrTicket.innerHTML = parseInt(h4NbrTicket.innerHTML) + 1;
    }else{
        // Mettez à jour l'interface utilisateur ici 
        if (ticket.state === 'Todo') {
            const todoContainer = document.getElementById('Todo');
            if (todoContainer) {
                // Créez un nouvel élément de ticket
                const newTicketElement = createTicketElement(ticket);
                
                // Ajoutez le nouveau ticket au début de la liste
                todoContainer.insertAdjacentHTML('afterbegin', newTicketElement);
                
            }
        }
    }

});

// Fonction pour créer l'élément HTML du ticket pour la passage apres socket usefull fil composed ticket 
function createTicketElement(ticket) {
    const projectMembers = JSON.parse(document?.getElementById('projectMembers')?.dataset.members);
    assignee = projectMembers.find(member => member.id === ticket.assignee);
    return `
        <div data-ticketid="${ticket.id}" class="card mb-1">
            <div class="card-body">
                <h6 class="card-title">${ticket.title}</h6>
                <span class="badge bg-primary">${new Date(ticket.createdAt).toLocaleDateString()}</span>
                <p class="card-text mt-2 small">${ticket.description.length > 60 ? ticket.description.substring(0, 60) + '…' : ticket.description}</p>
                <div class="d-flex justify-content-between align-items-center">
                    <span class="badge bg-info">${assignee.name}</span>
                    <div class="dropdown">
                        <img class="dropdown-toggle rouded-circle" src="/img/members/${assignee.avatar}" width="35" height="35" data-bs-toggle="dropdown" aria-expanded="false" />
                        <ul class="dropdown-menu">
                            ${createMemberDropdownItems(ticket,projectMembers)}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Fonction pour créer les éléments du dropdown des membres
function createMemberDropdownItems(ticket,projectMembers) {
    return projectMembers.map(member => `
        <li>
            <button data-ticket="${ticket.id}" data-assignee="${member.id}" class="dropdown-item changeAssigneeToDo d-flex justify-content-start" type="button">
                <img src="/img/members/${member.avatar}" class="rounded-circle me-2" width="35" height="35" />
                ${member.name.split(' ')[0]}
            </button>
        </li>
    `).join('');
}

//end of new ticket with socket

//update
ticketSocket.on('updatedNormalTicket', (ticket) => {
    // Mettez à jour l'interface utilisateur ici
    if(!document?.getElementById('stats-data')){
        const ticketElement = document.querySelector(`[data-ticketid="${ticket.id}"]`);
        ticketElement.parentElement.removeChild(ticketElement);
        document.getElementById(ticket.state).appendChild(ticketElement);
    }
    if(document?.getElementById('stats-data')){
        const statsElement = document.getElementById('stats-data');
        let todo = parseFloat(statsElement.dataset.todo);
        let doing = parseFloat(statsElement.dataset.doing);
        let done = parseFloat(statsElement.dataset.done);

       // Calculez le nombre total de tickets actuel
       const totalPercentage = todo + doing + done;
       let totalTickets = 100 / totalPercentage;

       // Ajoutez le nouveau ticket
       totalTickets++;

       // Recalculez les pourcentages
       if (ticket.state === 'Todo') {
           todo = ((todo * (totalTickets - 1) / 100) + 1) / totalTickets * 100;
           doing = (doing * (totalTickets - 1) / 100) / totalTickets * 100;
           done = (done * (totalTickets - 1) / 100) / totalTickets * 100;
       } else if (ticket.state === 'Doing') {
           todo = (todo * (totalTickets - 1) / 100) / totalTickets * 100;
           doing = ((doing * (totalTickets - 1) / 100) + 1) / totalTickets * 100;
           done = (done * (totalTickets - 1) / 100) / totalTickets * 100;
       } else if (ticket.state === 'Done') {
           todo = (todo * (totalTickets - 1) / 100) / totalTickets * 100;
           doing = (doing * (totalTickets - 1) / 100) / totalTickets * 100;
           done = ((done * (totalTickets - 1) / 100) + 1) / totalTickets * 100;
       }

       const stats = {
           TODO: todo.toFixed(1),
           DOING: doing.toFixed(1),
           DONE: done.toFixed(1)
       };

       console.log('Stats:', stats);
       
        const data = {
          labels: ['TODO', 'DOING', 'DONE'],
          datasets: [{
            label: 'Répartition des tickets (%)',
            data: [stats.TODO, stats.DOING, stats.DONE],
            backgroundColor: [
              'rgba(220, 38, 38, 0.7)',   // TODO - $danger - #dc2626
              'rgba(245, 158, 11, 0.7)',  // DOING - $warning - #f59e0b
              'rgba(22, 163, 74, 0.7)'    // DONE - $success - #16a34a
            ],
            borderColor: [
              'rgba(220, 38, 38, 0.7)',
              'rgba(245, 158, 11, 0.7)',
              'rgba(22, 163, 74, 0.7)'
            ],
            borderWidth: 1
          }]
        };
      
        const config = {
          type: 'pie',
          data: data,
          options: {
            plugins: {
              tooltip: {
                callbacks: {
                  label: function(context) {
                    return `${context.label}: ${context.raw}%`;
                  }
                }
              }
            }
          }
        };
        // Utilisation
        const newChartElement = recreateElement('myPieChart');
        if (newChartElement) {
            globalChart = new Chart(newChartElement, config);
        }
        statsElement.dataset.todo = stats.TODO;
            statsElement.dataset.doing = stats.DOING;
            statsElement.dataset.done = stats.DONE;
            const h2Todo = document.getElementById('ticket-todo');
            const h2Doing = document.getElementById('ticket-doing');
            const h2Done = document.getElementById('ticket-done');
            h2Todo.innerHTML = stats.TODO + '%';
            h2Doing.innerHTML = stats.DOING + '%';
            h2Done.innerHTML = stats.DONE + '%';
        const newState = document?.getElementById(`ticket${ticket.id}`);
        if(newState){
            switch (ticket.state) {
                case 'Todo':
                    newState.classList.remove('badge', 'bg-warning');
                    newState.classList.add('badge','bg-danger');
                    break;
                case 'Doing':
                    newState.classList.remove('badge' ,'bg-danger');
                    newState.classList.add('badge' ,'bg-warning');
                    break;
                case 'Done':
                    newState.classList.remove('badge' ,'bg-warning');
                    newState.classList.add('badge' ,'bg-success');
                    break;
                default:
                    break;
        }
        newState.innerHTML = ticket.state;

    }
}
});


//delete
ticketSocket.on('deletedNormalTicket', (ticketId) => {
    console.log('Deleted normal ticket ID received from client:', ticketId);
    if(document?.getElementById('scrumBoardContainer' )){
        const ticketElement = document.querySelector(`[data-ticketid="${ticketId}"]`);
        ticketElement.parentElement.removeChild(ticketElement);
    }
    if(document?.getElementById('normalTicket'+ticketId)){
        const ticketElement = document.getElementById('normalTicket'+ticketId);
        ticketElement.innerHTML = '';
    }
    
});
/**
 * Événements pour les tickets composés
 * @new
 * @update 
 * @delete
 *  */
//new
ticketSocket.on('newComposedTicket', (ticket) => {
    console.log('New composed ticket received for client:', ticket);
    // Créez un nouvel élément de ticket
    if(!document?.getElementById('table-composed-tickets')){
        ticket.subTickets.forEach(normalTicket => {
            normalTicket.assignee = normalTicket.assignee.id;
            const normalTicketElement = createTicketElement(normalTicket);
            // Ajoutez le nouveau ticket au début de la liste
            document.getElementById('Todo').insertAdjacentHTML('afterbegin', normalTicketElement);
    
        })
    }else{
        const tableBody = document.getElementById('table-composed-tickets');
        const newRow = createComposedTicketRow(ticket);
        tableBody.insertAdjacentHTML('afterbegin', newRow);
    }
});

//update
ticketSocket.on('updateComposedTicket', (ticket) => {
    console.log('Updated composed ticket received:', ticket);
    
});
//delete
ticketSocket.on('deletedComposedTicket', (ticketId) => {
    console.log('Deleted composed ticket ID received:', ticketId);
    // Mettez à jour l'interface utilisateur ici
    if(document?.getElementById('table-composed-tickets')){
        const ticketElement = document.querySelector(`[data-ticketid="${ticketId}"]`);
        ticketElement.parentElement.removeChild(ticketElement);
    }


});

// Gestion des événements de déconnexion
ticketSocket.on('disconnect', () => {
    console.log('Disconnected from ticket socket');
});


// Gestion des erreurs
ticketSocket.on('error', (error) => {
    console.error('Socket error:', error);
});


/**
* DOM of adding new ligne of a normal ticket in the dashboard 
*/
function ajouterTicketViaSocket(ticket) {
    const tbody = document.getElementById('ticketsTableBody');
    const projectMembers = JSON.parse(document?.getElementById('projectMembers').dataset.members);
    let assignee = projectMembers.find(member => member.id === ticket.assignee);
    const newRow = `
      <tr>
        <th scope="row">${tbody.children.length + 1}</th>
        <td>${ticket.title}</td>
        <td>
          <span id="ticket${ticket.id}" class="badge bg-${ticket.state === 'Todo' ? 'danger' : ticket.state === 'Doing' ? 'warning' : 'success'}">
            ${ticket.state}
          </span>
        </td>
        <td>
          <img src="/img/members/${assignee.avatar}" 
            class="img-fluid rounded-circle"
            data-bs-toggle="tooltip" 
            data-bs-placement="right"
            data-bs-custom-class="custom-tooltip"
            data-bs-title="${assignee.name}" 
            width="40" 
            height="40" />
        </td>
        <td>${new Date(ticket.createdAt).toLocaleDateString()}</td>
        <td>${ticket.description}</td>
      </tr>
    `;
    tbody.insertAdjacentHTML('beforeend', newRow);
  }


/**
 * DOM methode pour la creation de la ligne du tableau des tickets composés
 */
function createComposedTicketRow(ticket) {
    const projectMembers = JSON.parse(document?.getElementById('projectMembers').dataset.members);
    let assignee = projectMembers.find(member => member.id === ticket.assignee);
    const row = `
    <tr>
        <td>
            <div class="d-flex align-items-center">
                <img
                    src="/img/members/${assignee.avatar}"
                    alt=""
                    style="width: 45px; height: 45px"
                    class="rounded-circle"
                />
                <div class="ms-3">
                    <p class="fw-bold mb-1">${assignee.name}</p>
                    <p class="text-muted mb-0">${assignee.email}</p>
                </div>
            </div>
        </td>
        <td>
            <p class="fw-normal mb-1">${ticket.title}</p>
        </td>
        <td>
            <span class="badge shadow text-light rounded-pill d-inline
                ${ticket.state === 'Done' ? 'bg-success' : ''}
                ${ticket.state === 'Todo' ? 'bg-warning' : ''}
                ${ticket.state === 'Doing' ? 'bg-danger' : ''}
            ">${ticket.state}</span>
        </td>
        <td>
            <div class="d-flex justify-content-start">
                ${ticket.subTickets.map(subTicket => createSubTicketElement(subTicket)).join('')}
            </div>
        </td>
        <td>
            <span class="badge shadow text-light rounded-pill d-inline
                ${ticket.priority === 'low' ? 'bg-success' : ''}
                ${ticket.priority === 'medium' ? 'bg-info' : ''}
                ${ticket.priority === 'high' ? 'bg-danger' : ''}
            ">${ticket.priority}</span>
        </td>
        <td>
            <button type="button" data-bs-toggle="modal" data-bs-target="#voireModal${ticket.id}" class="btn btn-link btn-sm me-1 btn-rounded">
                voire
            </button>
            <button type="button" data-bs-toggle="modal" data-bs-target="#editModal${ticket.id}" class="btn btn-link btn-sm me-1 btn-rounded">
                modifier
            </button>
            <button type="button" data-bs-toggle="modal" data-bs-target="#deleteModal${ticket.id}" class="btn btn-link btn-sm me-1 btn-rounded">
                supprimer
            </button>
        </td>
    </tr>
    `;

    const editModal = `
    <div class="modal fade" id="editModal${ticket.id}" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <form id="edit-composed-ticket-form${ticket.id}" method="post">
                    <div class="modal-header">
                        <h1 class="modal-title fs-5" id="exampleModalLabel">Modifier ticket ${ticket.title}</h1>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body modal-body-${ticket.id}">
                        <div class="form-group">
                            <label for="title${ticket.id}">Titre</label>
                            <input type="text" value="${ticket.title}" class="form-control" id="title${ticket.id}" name="title" required>
                        </div>
                        <div class="form-group">
                            <label for="description${ticket.id}">Description</label>
                            <textarea class="form-control" id="description${ticket.id}" name="description" rows="3" required>${ticket.description}</textarea>
                        </div>
                        ${ticket.state !== 'Done' ? `
                        <br>
                        <div class="form-group">
                            <label for="state${ticket.id}">etat</label>
                            <select class="form-select" id="state${ticket.id}" name="state">
                                <option ${ticket.state === 'Todo' ? 'selected' : ''} value="Todo">Todo</option>
                                <option ${ticket.state === 'Doing' ? 'selected' : ''} value="Doing">Doing</option>
                                <option ${ticket.state === 'Done' ? 'selected' : ''} value="Done">Done</option>
                            </select>
                        </div>
                        ` : ''}
                        <br>
                        <div class="form-group">
                            <label for="assignee">Assigné à</label>
                            <select class="form-select" id="assignee${ticket.id}" name="assignee" required>
                                <option value="" disabled>choix du porteur</option>
                                ${projectMembers.map(member => `
                                    <option class="d-flex" value="${member.id}" ${ticket.assignee === member.id ? 'selected' : ''}>
                                        <img src="/img/members/${member.avatar}" alt="logo member" width="30" height="30" class="img-fluid rounded-circle me-2" />
                                        ${member.name}
                                    </option>
                                `).join('')}
                            </select>
                        </div>
                        <input type="hidden" id="project${ticket.id}" value="${ticket.project}" />
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="submit" class="btn btn-primary">Modifier Ticket</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
    `;

    const deleteModal = `
    <div class="modal fade" id="deleteModal${ticket.id}" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h1 class="modal-title fs-5" id="exampleModalLabel">Supprimer ticket ${ticket.title}</h1>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body modal-supprimer-body-${ticket.id}">
                    <p class="fs-4 fw-medium title">Vous êtes sûr de suprimer le ticket <span class="badge shadow p-1 bg-primary text-white">${ticket.title}</span></p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="button" id="deleteComposedTicketButton${ticket.id}" class="btn btn-danger">Supprimer</button>
                </div>
            </div>
        </div>
    </div>
    `;

    const voireModal = `
    <div class="modal fade" id="voireModal${ticket.id}" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h1 class="modal-title fs-5" id="exampleModalLabel">Voir ticket ${ticket.title}</h1>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body modal-body-${ticket.id}">
                    <p class="fs-6 fw-medium title">Titre : ${ticket.title}</p>
                    <p class="fs-6 fw-normal description">Description : ${ticket.description}</p>
                    <p class="fs-6 state">Etat : ${ticket.state}</p>
                    <p class="fs-6 priority">Priorité : ${ticket.priority}</p>
                    <p class="fs-6 assignee">Assigné à : ${assignee.name}</p>
                    <p class="fs-6 creationDate">Créé le : ${new Date(ticket.createdAt).toLocaleDateString()}</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                </div>
            </div>
        </div>
    </div>
    `;

    return row + editModal + deleteModal + voireModal;
}

function createSubTicketElement(subTicket) {
    return `
    <img data-bs-toggle="modal" data-bs-target="#detailsSubTicket${subTicket.id}" src="/img/ticket.png" class="hover rounded-circle border border-dark bg-secondary img-fluid" width="30" height="30" style="margin-right: -10px;" />
    <!-- Modal -->
    <div class="modal fade" id="detailsSubTicket${subTicket.id}" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h1 class="modal-title fs-5" id="exampleModalLabel">${subTicket.title}</h1>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body modal-body-composed-${subTicket.id}">
                    <!-- Details du sous-ticket -->
                    <p><strong>Description:</strong> ${subTicket.description}</p>
                    <p><strong>Propriétaire:</strong> ${subTicket.assignee.name}</p>
                    <p><strong>Date de création:</strong> ${new Date(subTicket.createdAt).toLocaleString()}</p>
                    <p><strong>Statut:</strong> ${subTicket.state}</p>
                    <p><strong>Priorité:</strong> ${subTicket.priority}</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-primary">Save changes</button>
                </div>
            </div>
        </div>
    </div>
`;
}

/**
* Recreation de chart DOM
*/
function recreateElement(elementId) {
    const oldElement = document.getElementById(elementId);
    if (oldElement) {
        const parent = oldElement.parentNode;
        const nextSibling = oldElement.nextSibling;

        // Suppression de l'ancien élément
        oldElement.remove();

        // Création du nouvel élément
        const newElement = document.createElement(oldElement.tagName);
        newElement.id = elementId;

        // Ajout des attributs width et height
        newElement.setAttribute('width', '300');
        newElement.setAttribute('height', '300');

        // Ajout du style
        newElement.style.maxWidth = '300px';
        newElement.style.maxHeight = '300px';
        newElement.style.marginLeft = '25%';

        // Insertion du nouvel élément
        if (nextSibling) {
            parent.insertBefore(newElement, nextSibling);
        } else {
            parent.appendChild(newElement);
        }

        return newElement;
    }
    return null;
}




export { ticketSocket };