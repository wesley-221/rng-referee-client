import { MultiplayerDataUser } from "../../store-multiplayer/multiplayer-data-user";

/**
 * An interface with some methods that help you implement different score calculations
 */
export abstract class ScoreInterface {
    private identifier: string;
    private teamSize: number;
    private allUsers: MultiplayerDataUser[];

    /**
     * Calculate the score of the given player
     * @param player the player object to use the score calculations with
     * @returns the score of the player
     */
    public abstract calculatePlayerScore(player: MultiplayerDataUser): number;

    /**
     * Calculate the final score of team one
     * @returns the score of the team
     */
    public abstract calculateTeamOneScore(): number;

    /**
     * Calculate the final score of team two
     * @returns the score of the team
     */
    public abstract calculateTeamTwoScore(): number;

    /**
     * Initialize the score interface with the given identifier
     * @param identifier the identifier of the score interface
     */
    constructor(identifier: string) {
        this.identifier = identifier;
        this.allUsers = [];
    }

    /**
     * Add a user to the current score interface
     * @param user the user to add
     */
    public addUserScore(user: MultiplayerDataUser) {
        if(user == undefined) return;

        this.allUsers[user.slot] = user;
    }

    /**
     * Adds several users to the current score interface
     * @param users the users object to add
     */
    public addUserScores(users: MultiplayerDataUser[]) {
        for(let user of users) {
            this.addUserScore(user);
        }
    }

    /**
     * Get all the users of the current score interface
     */
    public getUserScores(): MultiplayerDataUser[] {
        return this.allUsers;
    }

    /**
     * Get a user by the given slot
     * @param slot 
     */
    public getUserScoreBySlot(slot: number): MultiplayerDataUser {
        for(let user of this.allUsers) {
            if(user.slot == slot) {
                return user;
            }
        }

        const newUser = new MultiplayerDataUser();
        newUser.slot = slot;
        newUser.score = 0;
        newUser.passed = 0;
        newUser.accuracy = 0;

        return newUser;
    }

    /**
     * Get the identifier of the score interface
     */
    public getIdentifier(): string {
        return this.identifier;
    }

    /**
     * Set the size of the teams
     * @param teamSize the size of a single team
     */
    public setTeamSize(teamSize: number): void {
        this.teamSize = teamSize;

        // Initialize the array with empty users
        for(let i = 0; i < this.teamSize * 2; i ++) {
            this.addUserScore(this.getUserScoreBySlot(i));
        }
    }

    /**
     * Get the team size of the score interface
     */
    public getTeamSize(): number {
        return this.teamSize;
    }
}