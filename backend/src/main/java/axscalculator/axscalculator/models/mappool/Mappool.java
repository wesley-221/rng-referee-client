package axscalculator.axscalculator.models.mappool;

import com.fasterxml.jackson.annotation.JsonView;

import java.util.ArrayList;

public class Mappool {
	private long id;
	private String publish_id;
	private String name;
	private ArrayList<ModBracket> modBrackets;

	public Mappool(long id, String publish_id, String name) {
		this.id = id;
		this.publish_id = publish_id;
		this.name = name;
		this.modBrackets = new ArrayList<>();
	}

	public long getId() {
		return id;
	}

	public String getPublish_id() {
		return publish_id;
	}

	public String getName() {
		return name;
	}

	public ArrayList<ModBracket> getModBrackets() {
		return modBrackets;
	}

	public void addBracket(ModBracket modBracket) {
		this.modBrackets.add(modBracket);
	}

	public void removeBracket(ModBracket modBracket) {
		this.modBrackets.remove(modBracket);
	}

	public void setId(long id) {
		this.id = id;
	}
}
