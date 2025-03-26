export const hideAlert = () => {
    const alert = document.querySelector('.alert');
    if (alert) alert.parentElement.removeChild(alert);// remove alert if it exists in the DOM
}

export const showAlert = (type,message,classSelector) => {
    hideAlert();
    const markup = `<div class="alert alert-${type}">${message}</div>`;
    document.querySelector(classSelector).insertAdjacentHTML('afterbegin', markup);
    window.setTimeout(hideAlert, 3000); // hide alert after 3 seconds
}