import { Activity } from "@domain/entities/Activity";
import { IActivityRepository } from "@interfaces/persistence/IActivityRepository";
import { ILoggerService } from "@interfaces/ILoggerService";

export const CreateOrUpdateActivity = (
    ActivityRepository: IActivityRepository,
    LoggerService: ILoggerService
) => {
    async function Execute(
        params: Record<string, any>,
        username: string | null
    ): Promise<Activity> {
        let activityId = params.id;
        delete params.id;

        let activity;
        if ("NEW" === activityId) {
            LoggerService.verbose("Admin is creating an activity");
            params.author = username;
            activity = await ActivityRepository.create(params);
        } else {
            LoggerService.verbose(
                `Admin is updating the activity ${activityId}`
            );
            activity = await ActivityRepository.update(activityId, params);
        }

        return activity;
    }
    return { Execute };
};
