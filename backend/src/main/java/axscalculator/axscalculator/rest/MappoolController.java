package axscalculator.axscalculator.rest;

import axscalculator.axscalculator.models.mappool.Mappool;
import axscalculator.axscalculator.repositories.MappoolRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.converter.json.MappingJacksonValue;
import org.springframework.web.bind.annotation.*;

@RestController
public class MappoolController {
	@Autowired
	private MappoolRepository mappoolRepository;

	@GetMapping("/mappools/get")
	public MappingJacksonValue getAllMappools() {
		return new MappingJacksonValue(this.mappoolRepository.getAll());
	}

	@GetMapping("/mappools/get/{id}")
	public Mappool getMappoolById(@PathVariable int id) {
		return this.mappoolRepository.getById(id);
	}

	@PutMapping("/mappools/update")
	@PostMapping("/mappools/update")
	public Mappool updateMappool(@RequestBody Mappool mappool) {
		return this.mappoolRepository.save(mappool);
	}
}
