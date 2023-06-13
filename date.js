exports.getDate = function() {
    const today = new Date();
    const options = {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    };
    return today.toLocaleString('en-US', options);
}


exports.getDay = function() {
    const today = new Date();
    const options = {
        weekday: 'long',
        // day: 'numeric',
        // month: 'long',
    }
    return today.toLocaleString('en-US', options);
}

// function getDate() {
//     const today = new Date();
//     const options = {
//         weekday: 'long',
//         day: 'numeric',
//         month: 'long',
//     };
//     return today.toLocaleString('en-US', options);
// }

// function getDay(){
//     const today = new Date();
//     const options = {
//         weekday: 'long',
//         // day: 'numeric',
//         // month: 'long',
//     }
//     return today.toLocaleString('en-US', options);
// }