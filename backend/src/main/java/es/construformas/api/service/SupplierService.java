package es.construformas.api.service;

import es.construformas.api.model.Supplier;
import es.construformas.api.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class SupplierService {

    private final SupplierRepository supplierRepository;

    public Supplier create(Supplier supplier) {
        return supplierRepository.save(supplier);
    }

    public Supplier findById(Long id) {
        return supplierRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Supplier not found"));
    }

    public List<Supplier> findAll() {
        return supplierRepository.findAll();
    }

    public List<Supplier> search(String name) {
        return supplierRepository.findByNameContainingIgnoreCase(name);
    }

    public Supplier update(Long id, Supplier updated) {
        Supplier existing = findById(id);
        existing.setName(updated.getName());
        existing.setContactName(updated.getContactName());
        existing.setEmail(updated.getEmail());
        existing.setPhone(updated.getPhone());
        existing.setAddress(updated.getAddress());
        existing.setCity(updated.getCity());
        existing.setPostalCode(updated.getPostalCode());
        existing.setTaxId(updated.getTaxId());
        existing.setBankAccount(updated.getBankAccount());
        existing.setNotes(updated.getNotes());
        existing.setActive(updated.isActive());
        return supplierRepository.save(existing);
    }

    public void delete(Long id) {
        supplierRepository.deleteById(id);
    }
}
