package axscalculator.axscalculator.models.mappool;

import com.fasterxml.jackson.annotation.JsonView;

import java.util.ArrayList;

public class ModBracket {
	private int id;
	private String bracketName;
	private String mods;
	private ArrayList<ModBracketMap> beatmaps;

	public ModBracket() {
		super();
	}

	public ModBracket(int id, String bracketName, String mods) {
		this.id = id;
		this.bracketName = bracketName;
		this.mods = mods;
		this.beatmaps = new ArrayList<>();
	}

	public int getId() {
		return id;
	}

	public String getBracketName() {
		return bracketName;
	}

	public String getMods() {
		return mods;
	}

	public ArrayList<ModBracketMap> getBeatmaps() {
		return beatmaps;
	}

	public void addBeatmap(ModBracketMap map) {
		this.beatmaps.add(map);
	}

	public void removeMap(ModBracketMap map) {
		this.beatmaps.remove(map);
	}
}
