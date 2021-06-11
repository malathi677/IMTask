module.exports.getTimeStamp = (date, time)=>{
    const dateParts = date.split("/");
    const timeParts = time.split(":");
    const dateStr = new Date(dateParts[2], dateParts[1] - 1, dateParts[0], timeParts[0], timeParts[1]);
    return Date.parse(dateStr);
}


