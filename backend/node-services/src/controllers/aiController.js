class AIController {
    async triggerAIProcess(req, res) {
        try {
            const { inputData } = req.body;
            // Forward the request to the AI service (Python service)
            const response = await aiService.processInput(inputData);
            res.status(200).json(response);
        } catch (error) {
            console.error("Error triggering AI process:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    async scheduleAIProcess(req, res) {
        try {
            const { cronExpression, inputData } = req.body;
            // Schedule the AI process using the scheduler service
            await scheduler.scheduleTask(cronExpression, async () => {
                await aiService.processInput(inputData);
            });
            res.status(201).json({ message: "AI process scheduled successfully" });
        } catch (error) {
            console.error("Error scheduling AI process:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
}

export default new AIController();