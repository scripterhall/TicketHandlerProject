import {io} from 'socket.io-client';

const invitationSocket = io('/invitation')

// Créer un objet Audio pour le son de notification
const notificationSound = new Audio('/sounds/notification.mp3');

// Gestion des événements de connexion
invitationSocket.on('connect', () => {
    console.log('Connected to invitation socket');
});

// Gestion des événements de send invitation
invitationSocket.on('newInvitation', (data) => {
    console.log('Invitation sent to client: ', data);
    addNewInvitationToNavbar(data);
    playNotificationSound();
});


invitationSocket.on('disconnect', () => {
    console.log('Disconnected from invitation socket');
});

// Gestion des erreurs
invitationSocket.on('error', (error) => {
    console.error('Socket error: ', error);
    
});



/**
 * methode de manipulation de DOM pour ajouter une nouvelle invitation au navbar
 */
function addNewInvitationToNavbar(invitation) {
    const notificationDropdown = document.querySelector('.dropdown-menu[aria-labelledby="notificationDropdown"]');
    if (notificationDropdown) {
        const newInvitationElement = `
            <li class="dropdown-item">
                <div class="d-flex align-items-center">
                    <img src="/img/members/${invitation.member.avatar}" alt="Notification Icon" class="rounded-circle me-2" width="40">
                    <div>
                        <p class="mb-0 small"><strong>${invitation.messageInvitation}</strong></p>
                        <small class="text-muted">invitation envoyé le ${new Date(invitation.createdAt).toLocaleDateString()}</small>
                    </div>
                </div>
            </li>
        `;
        
        // Insérer le nouvel élément après l'en-tête du dropdown
        const dropdownHeader = notificationDropdown.querySelector('.dropdown-header');
        if (dropdownHeader) {
            dropdownHeader.insertAdjacentHTML('afterend', newInvitationElement);
        } else {
            notificationDropdown.insertAdjacentHTML('afterbegin', newInvitationElement);
        }

        // Mettre à jour le compteur de notifications si présent
        const notificationCounter = document.querySelector('.notification');
        if (notificationCounter) {
            const currentCount = parseInt(notificationCounter.textContent, 10);
            notificationCounter.textContent = currentCount + 1;
        }
    }
}
/**
 * Fonction pour jouer le son de notification
 */
function playNotificationSound() {
    notificationSound.play().catch(error => console.error('Error playing sound:', error));
}

export {invitationSocket };
