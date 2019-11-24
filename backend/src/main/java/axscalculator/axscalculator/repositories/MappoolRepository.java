package axscalculator.axscalculator.repositories;

import axscalculator.axscalculator.models.mappool.Mappool;

import java.util.List;

public interface MappoolRepository {
	List<Mappool> getAll();
	Mappool getById(int id);
	boolean delete(int id);
	Mappool save(Mappool mappool);
}