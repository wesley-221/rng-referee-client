import { ScoreInterface } from "./score-interface";
import { MultiplayerDataUser } from "../../store-multiplayer/multiplayer-data-user";

export class AxSCalculation extends ScoreInterface {
    private modifier: number = 0; 

    public calculatePlayerScore(player: MultiplayerDataUser): number {
        return Number(player != null ? player.score : 0);
    }

    public calculateTeamOneScore() {
        let users: MultiplayerDataUser[] = [];

        for(let i = 0; i < this.getTeamSize(); i ++) {
            let currentUser = this.getUserScoreBySlot(i);

            if(currentUser.slot == 0) {
                currentUser.score = (currentUser.passed == 0 ? 0 : AxSCalculation.calculateAccuracyPlayerScore(currentUser.score));
                currentUser.caption = "Accuracy player";
            }
            else {
                currentUser.score = (currentUser.passed == 0 ? 0 : AxSCalculation.calculateScorePlayerScore(currentUser.score, currentUser.accuracy, this.modifier));
                currentUser.caption = "Score player";
            }

            users.push(currentUser);
        }

        return AxSCalculation.calculateTeamScore(users[0].score, users[1].score, users[2].score, users[0].accuracy, this.modifier);
    }

    public calculateTeamTwoScore() {
        let users: MultiplayerDataUser[] = [];

        for(let i = this.getTeamSize(); i < this.getTeamSize() * 2; i ++) {
            let currentUser = this.getUserScoreBySlot(i);

            if(currentUser.slot == 3) {
                currentUser.score = (currentUser.passed == 0 ? 0 : AxSCalculation.calculateAccuracyPlayerScore(currentUser.score));
                currentUser.caption = "Accuracy player";
            }
            else {
                currentUser.score = (currentUser.passed == 0 ? 0 : AxSCalculation.calculateScorePlayerScore(currentUser.score, currentUser.accuracy, this.modifier));
                currentUser.caption = "Score player";
            }

            users.push(currentUser);
        }

        return AxSCalculation.calculateTeamScore(users[0].score, users[1].score, users[2].score, users[0].accuracy, this.modifier);
    }

    public setModifier(modifier: number) {
        this.modifier = modifier;
    }

    /**
     * Calculate the score of the accuracy player
     * @param score the full score of the accuracy player
     */
    private static calculateAccuracyPlayerScore(score: number) {
        return (score * 0.2);
    }

    /**
     * Calculate the score of a score player with the given modifier
     * @param score the full score of the player
     * @param accuracy the accuracy of the player
     * @param modifier the modifier of the map
     */
    private static calculateScorePlayerScore(score: number, accuracy: number, modifier: number) {        
        return (score * (Math.pow((100 - ((100 - accuracy) / 5)) / 100, modifier)));
    }

    /**
     * Calculate the team score with all the given scores and modifier
     * @param score_player_one the final calculated score of player one
     * @param score_player_two the final calculated score of player two
     * @param score_player_three the final calculated score of player three
     * @param accuracy_player_one the accuracy of player one
     * @param modifier the modifier of the map
     */
    private static calculateTeamScore(score_player_one: number, score_player_two: number, score_player_three: number, accuracy_player_one:number, modifier:number): number {
        return Number((((score_player_one) + (score_player_two) + (score_player_three)) * (Math.pow(accuracy_player_one / 100, modifier))).toFixed());
    }
}