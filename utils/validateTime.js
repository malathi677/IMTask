module.exports.validateTime = (time) => {
    return time.match(/\bpm\b|\bam\b/gi) ? false : true;
}