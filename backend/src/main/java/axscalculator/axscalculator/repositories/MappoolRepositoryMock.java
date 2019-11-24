package axscalculator.axscalculator.repositories;

import axscalculator.axscalculator.models.mappool.Gamemode;
import axscalculator.axscalculator.models.mappool.Mappool;
import axscalculator.axscalculator.models.mappool.ModBracket;
import axscalculator.axscalculator.models.mappool.ModBracketMap;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class MappoolRepositoryMock implements MappoolRepository {
	private List<Mappool> mappools;
	private long lastId = 0;

	public MappoolRepositoryMock() {
		this.mappools = new ArrayList<>();

		Mappool mappool1 = new Mappool(lastId, "1208371hsjioasd", "AxS grand finals");
		ModBracket modBracket1 = new ModBracket(0, "Nomod", "!mp mods none");
		ModBracket modBracket2 = new ModBracket(1, "Hidden", "!mp mods hidden");

		ModBracketMap modBracketMap1 = new ModBracketMap(1535572, "TERRASPEX - AMAZING BREAK [KYUARE SPEC'S INVASION] (Spectator)", "https://osu.ppy.sh/beatmaps/1535572", 19, Gamemode.Catch);
		ModBracketMap modBracketMap2 = new ModBracketMap(1535572, "wa. - Black Lotus [The Withered Petal] (Razor Sharp)", "https://osu.ppy.sh/beatmaps/1484965", 18, Gamemode.Catch);

		ModBracketMap modBracketMap3 = new ModBracketMap(102922, "KAZE.o2SE - Earth Quake [CTB normal competition] (ZHSteven)", "https://osu.ppy.sh/beatmaps/102922", 15, Gamemode.Catch);
		ModBracketMap modBracketMap4 = new ModBracketMap(915669, "Halozy - Three Magic (DiGiTAL WiNG TRANCE Remix) [Sealed Great Magician] (breathless)", "https://osu.ppy.sh/beatmaps/915669", 17, Gamemode.Catch);

		modBracket1.addBeatmap(modBracketMap1);
		modBracket1.addBeatmap(modBracketMap2);

		modBracket2.addBeatmap(modBracketMap3);
		modBracket2.addBeatmap(modBracketMap4);

		mappool1.addBracket(modBracket1);
		mappool1.addBracket(modBracket2);

		this.mappools.add(mappool1);
	}

	/**
	 * Get all the mappools
	 * @return
	 */
	@Override
	public List<Mappool> getAll() {
		return mappools;
	}

	/**
	 * Get a mappool by the given id
	 * @param id
	 * @return
	 */
	@Override
	public Mappool getById(int id) {
		Mappool returnMappool = null;

		for(Mappool mappool : this.mappools) {
			if(mappool.getId() == id) {
				returnMappool = mappool;
				break;
			}
		}

		return returnMappool;
	}

	/**
	 * Delete a mappool with the given id
	 * @param id
	 * @return
	 */
	@Override
	public boolean delete(int id) {
		for(Mappool mappool : this.mappools) {
			if(mappool.getId() == id) {
				return this.mappools.remove(mappool);
			}
		}

		return false;
	}

	/**
	 * Save the mappool by the given id
	 * @param mappool
	 * @return
	 */
	@Override
	public Mappool save(Mappool mappool) {
		if(mappool.getId() > 0) {
			for(Mappool getMappool : this.mappools) {
				if(getMappool.getId() == mappool.getId()) {
					return this.mappools.set(this.mappools.indexOf(getMappool), mappool);
				}
			}
		}
		else {
			mappool.setId(this.lastId);
			this.mappools.add(mappool);

			this.lastId ++;
		}

		return mappool;
	}
}
