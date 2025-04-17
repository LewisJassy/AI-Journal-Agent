const cron = require('node-cron');

const scheduleTask = (cronExpression, taskFunction) => {
    return cron.schedule(cronExpression, taskFunction);
};

const scheduleJournalReminder = (time, reminderFunction) => {
    const cronExpression = `0 ${time.getHours()} ${time.getDate()} ${time.getMonth() + 1} *`;
    return scheduleTask(cronExpression, reminderFunction);
};

module.exports = {
    scheduleTask,
    scheduleJournalReminder
};