import { Component, OnInit } from '@angular/core';
import { MultiplayerLobby } from '../../../models/store-multiplayer/multiplayer-lobby';
import { MultiplayerLobbiesService } from '../../../services/multiplayer-lobbies.service';
import { ToastService } from '../../../services/toast.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { IrcService } from '../../../services/irc.service';
import { TournamentService } from '../../../services/tournaments.service';
import { Tournament } from '../../../models/tournament';

@Component({
	selector: 'app-create-lobby',
	templateUrl: './create-lobby.component.html',
	styleUrls: ['./create-lobby.component.scss']
})

export class CreateLobbyComponent implements OnInit {
	teamOneName: string;
	teamTwoName: string;
	multiplayerLobby: string;
	tournamentAcronym: string;
	matchDescription: string;
	selectedTournament: Tournament;

	validationForm: FormGroup;
	lobbyHasBeenCreated: boolean = false;

	ircAuthenticated: boolean = false;

	teamOneArray: number[] = [];
	teamTwoArray: number[] = [];

	constructor(private multiplayerLobbies: MultiplayerLobbiesService, private toastService: ToastService, private ircService: IrcService, public tournamentService: TournamentService) {
		ircService.getIsAuthenticated().subscribe(isAuthenticated => {
			this.ircAuthenticated = isAuthenticated;
		});
	}

	ngOnInit() {
		this.validationForm = new FormGroup({
			'multiplayerLink': new FormControl('', [
				Validators.pattern(/https\:\/\/osu.ppy.sh\/community\/matches\/[0-9]+/)
			]),
			'selectedTournament': new FormControl(''),
			'teamSize': new FormControl('', [
				Validators.required,
				Validators.min(1),
				Validators.max(6),
				Validators.pattern(/^\d$/)
			]),
			'teamOneName': new FormControl('', [
				Validators.required
			]),
			'teamTwoName': new FormControl('', [
				Validators.required
			]),
			'webhook': new FormControl()
		});
	}

	changeTournament() {
		this.selectedTournament = this.tournamentService.getTournamentByName(this.validationForm.get('selectedTournament').value);
	}

	createLobby() {
		const newLobby = new MultiplayerLobby();

		newLobby.lobbyId = this.multiplayerLobbies.availableLobbyId;
		newLobby.teamOneName = this.validationForm.get('teamOneName').value;
		newLobby.teamTwoName = this.validationForm.get('teamTwoName').value;
		newLobby.teamSize = this.validationForm.get('teamSize').value;
		newLobby.multiplayerLink = this.validationForm.get('multiplayerLink').value;
		newLobby.description = `${this.validationForm.get('teamOneName').value} vs ${this.validationForm.get('teamTwoName').value}`;
		newLobby.webhook = this.validationForm.get('webhook').value;
		newLobby.tournamentAcronym = this.tournamentService.getTournamentByName(this.validationForm.get('selectedTournament').value).acronym;

		if(newLobby.multiplayerLink == '') {
			this.ircService.isCreatingMultiplayerLobby = newLobby.lobbyId;

			this.ircService.client.say('BanchoBot', `!mp make ${newLobby.tournamentAcronym}: (${newLobby.teamOneName}) vs (${newLobby.teamTwoName})`);
		}

		this.lobbyHasBeenCreated = true;

		setTimeout(() => {
			this.lobbyHasBeenCreated = false;
		}, 3000);

		this.multiplayerLobbies.add(newLobby);

		this.toastService.addToast(`Successfully created the multiplayer lobby ${newLobby.description}!`);
	}

	getValidation(key: string): any {
		return this.validationForm.get(key);
	}

	changeTeamSize() {
		this.teamOneArray = [];
		this.teamTwoArray = [];

		const 	teamSizeValue = parseInt(this.validationForm.get('teamSize').value),
				teamSize = teamSizeValue > 8 ? 8 : teamSizeValue;

		for(let i = 1; i < (teamSize + 1); i ++) {
			this.teamOneArray.push(i);
		}

		for(let i = teamSize + 1; i < ((teamSize * 2) + 1); i ++) {
			this.teamTwoArray.push(i);
		}
	}
}
