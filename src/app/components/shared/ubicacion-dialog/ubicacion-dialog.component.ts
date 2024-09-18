import { Component, OnInit } from '@angular/core';
import { UbicacionService } from 'src/app/services/Ubicacion/ubicacion.service';
import { MatDialogRef } from '@angular/material/dialog';
import { Ubicacion } from 'src/app/interfaces/Ubicacion/Ubicacion'; // Asegúrate de tener esta interfaz creada

@Component({
  selector: 'app-ubicacion-dialog',
  templateUrl: './ubicacion-dialog.component.html',
  styleUrls: ['./ubicacion-dialog.component.css']
})
export class UbicacionDialogComponent implements OnInit {
  catalogHierarchy: Ubicacion[] = [];
  catalogLevels: any[] = [];
  finalSelection?: Ubicacion;
  displayedCatalogs: Ubicacion[] = [];
  aulaDescSeleccionada: string = ''; // Propiedad para guardar la descripción del aula

  constructor(private ubicacionService: UbicacionService,
    public dialogRef: MatDialogRef<UbicacionDialogComponent>
  ) {}

  ngOnInit() {
    this.loadAllUbicaciones();
  }

  loadAllUbicaciones(): void {
    this.ubicacionService.getUbicaciones().subscribe(ubicaciones => {
      this.catalogHierarchy = ubicaciones;
      this.initializeLevels();
    });
  }

  initializeLevels() {
    // Nivel 1: Campus
    this.catalogLevels = [{
      label: 'Seleccione un campus',
      catalogs: this.getUniqueCampus(),
      selected: null
    }];
  }

  getUniqueCampus() {
    const campuses = [...new Set(this.catalogHierarchy.map(ubic => ubic.campus))];
    return campuses.map(campus => {
      let nombre = campus;
      if (campus === 'M') {
        nombre = 'TRUJILLO';
      } else if (campus === 'PI') {
        nombre = 'PIURA';
      }
      return { codi: campus, nombre: nombre };
    });
  }
  

  onCatalogClick(catalog: any, levelIndex: number): void {
    this.catalogLevels[levelIndex].selected = catalog.codi;
    this.catalogLevels = this.catalogLevels.slice(0, levelIndex + 1);

    if (levelIndex === 0) { // Si seleccionamos el campus
      const pabellones = this.catalogHierarchy.filter(c => c.campus === catalog.codi);
      const uniquePabellones = [...new Set(pabellones.map(c => c.pabellon))];
      const formattedPabellones = uniquePabellones.map(pabellon => {
        const pabellonDesc = pabellones.find(p => p.pabellon === pabellon)?.pabellon_desc;
        return { codi: pabellon, nombre: pabellonDesc || pabellon };
      });

      this.catalogLevels.push({
        label: 'Seleccione un pabellón',
        catalogs: formattedPabellones,
        selected: null
      });
    } else if (levelIndex === 1) { // Si seleccionamos el pabellón
      const aulas = this.catalogHierarchy.filter(c => c.pabellon === catalog.codi);
      const uniqueAulas = [...new Set(aulas.map(c => c.aula))];
      const formattedAulas = uniqueAulas.map(aula => {
        const aulaDesc = aulas.find(a => a.aula === aula)?.aula;
        return { codi: aula, nombre: aulaDesc || aula };
      });

      this.catalogLevels.push({
        label: 'Seleccione un aula',
        catalogs: formattedAulas,
        selected: null
      });
    } else if (levelIndex === 2) { // Si seleccionamos el aula final
      const selectedAula = this.catalogHierarchy.find(c => c.aula === catalog.codi);
      if (selectedAula) {
        this.finalSelection = selectedAula;
        this.aulaDescSeleccionada = selectedAula.aula_desc; // Guardar la descripción del aula seleccionada
      }
    }
  }

  selectFinalCatalog(): void {
    if (this.finalSelection) {
      console.log("Selección final: ", this.finalSelection);
      this.dialogRef.close(this.finalSelection); 
      // Aquí puedes realizar alguna acción con la selección final
    }
  }
}
