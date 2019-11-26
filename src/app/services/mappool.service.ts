import { Injectable } from '@angular/core';
import { Mappool } from '../models/osu-mappool/mappool';
import { StoreService } from './store.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
  	providedIn: 'root'
})

export class MappoolService {
	private readonly mappoolUrl: string = "http://localhost:8080/mappools";
	creationMappool: Mappool;

	allMappools: Mappool[] = [];
	availableMappoolId: number = 0;

  	constructor(private storeService: StoreService, private httpClient: HttpClient) {
		this.creationMappool = new Mappool(null, null, null);

		const storeAllMappools = storeService.get('cache.mappool');

		// Loop through all the mappools
		for(let mappool in storeAllMappools) {
			const 	thisMappool = storeAllMappools[mappool], 
					newMappool = Mappool.serializeJson(thisMappool);

			this.availableMappoolId = newMappool.id + 1;
			this.allMappools.push(newMappool);
		}
	}

	/**
	 * Get all mappools from the backend
	 */
	public getAllMappools() {
		return this.httpClient.get<Mappool[]>(`${this.mappoolUrl}/get`);
	}

	/**
	 * Get the mappool of the given id
	 * @param mappoolId the id of the mappool
	 */
	public getMappool(mappoolId: number): Mappool {
		let returnMappool: Mappool = null;

		for(let i in this.allMappools) {
			if(this.allMappools[i].id == mappoolId) {
				returnMappool = this.allMappools[i];
				break;
			}
		}

		return returnMappool;
	}

	/**
	 * Save the mappool in the store and add it to the service
	 * @param mappool the mappool to save
	 */
	public createMappool(mappool: Mappool): void {
		this.allMappools.push(mappool);
		this.storeService.set(`cache.mappool.${mappool.id}`, mappool.convertToJson());
	}

	/**
	 * Update the mappool with the given id
	 * @param mappool the mappool to update
	 */
	public updateMappool(mappool: Mappool): void {
		for(let i in this.allMappools) {
			if(this.allMappools[i].id == mappool.id) {
				this.allMappools[i] = mappool;

				this.storeService.set(`cache.mappool.${mappool.id}`, mappool.convertToJson());
				return;
			}
		}
	}

	/**
	 * Delete the mappool in the store and service
	 * @param mappool the mappool to delete
	 */
	public deleteMappool(mappool: Mappool) {
		this.allMappools.splice(this.allMappools.indexOf(mappool), 1);
		this.storeService.delete(`cache.mappool.${mappool.id}`);
	}

	/**
	 * Publish a mappool to the backend
	 * @param mappool the mappool to publish
	 */
	public publishMappool(mappool: Mappool) {
		return this.httpClient.put<Mappool>(`${this.mappoolUrl}/update`, mappool);
	}

	/**
	 * Delete the mappool from the backend
	 * @param mappool 
	 */
	public unPublishedMappool(mappool: Mappool) {
		return this.httpClient.delete<Mappool>(`${this.mappoolUrl}/delete/${mappool.publish_id}`);
	}

	/**
	 * Get a published mappool by the published_id
	 * @param publish_id the id of the mappool that was published
	 */
	public getPublishedMappool(publish_id: string) {
		return this.httpClient.get<Mappool>(`${this.mappoolUrl}/get/${publish_id}`);
	}
}
