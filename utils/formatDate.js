module.exports = (timestamp) => {
    let date;
    timestamp ? date = new Date(timestamp) : date = new Date();

    return `${date.getDate().length == 1 ? '0' + date.getDate() : date.getDate()}/${(date.getMonth() + 1).toString().length == 1 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1)}/${date.getFullYear()} - ${date.getHours().toString().length == 1 ? '0' + date.getHours().toString() : date.getHours()}:${date.getMinutes().toString().length == 1 ? '0' + date.getMinutes().toString() : date.getMinutes()}:${date.getSeconds().toString().length == 1 ? '0' + date.getSeconds().toString() : date.getSeconds()}`;
};