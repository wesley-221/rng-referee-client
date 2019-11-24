package axscalculator.axscalculator.models.mappool;

public class ModBracketMap {
	private int beatmapId;
	private String beatmapName;
	private String beatmapUrl;
	private int modifier;
	private Gamemode gamemodeId;

	public ModBracketMap(int beatmapId, String beatmapName, String beatmapUrl, int modifier, Gamemode gamemodeId) {
		this.beatmapId = beatmapId;
		this.beatmapName = beatmapName;
		this.beatmapUrl = beatmapUrl;
		this.modifier = modifier;
		this.gamemodeId = gamemodeId;
	}

	public int getBeatmapId() {
		return beatmapId;
	}

	public String getBeatmapName() {
		return beatmapName;
	}

	public String getBeatmapUrl() {
		return beatmapUrl;
	}

	public int getModifier() {
		return modifier;
	}

	public Gamemode getGamemodeId() {
		return gamemodeId;
	}
}
