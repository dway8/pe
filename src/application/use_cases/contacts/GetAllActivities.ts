import { IActivityRepository } from "@interfaces/persistence/IActivityRepository";

export const GetAllActivities = (ActivityRepository: IActivityRepository) => {
    async function Execute() {
        const allActivities = await ActivityRepository.getAll();

        const allActsExceptNotes = allActivities.filter(
            (a) => a.activityType !== "Note"
        );

        return allActsExceptNotes;
    }

    return { Execute };
};
