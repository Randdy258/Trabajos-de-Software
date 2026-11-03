package com.ahorrojuego.app

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import java.util.TimeZone

class MainViewModel(app: Application) : AndroidViewModel(app) {
    private val repo = Repositorio(app)
    private var movs = repo.movimientos()
    private var meta = repo.meta()

    private val _estado = MutableLiveData<Estado>()
    val estado: LiveData<Estado> = _estado

    init { emitir() }

    fun agregar(tipo: Tipo, monto: Double, nota: String) {
        val ahora = System.currentTimeMillis()
        movs = movs + Movimiento(ahora, tipo, monto, nota, ahora)
        repo.guardarMovimientos(movs)
        emitir()
    }

    fun eliminar(id: Long) {
        movs = movs.filter { it.id != id }
        repo.guardarMovimientos(movs)
        emitir()
    }

    fun cambiarMeta(nueva: Meta) {
        meta = nueva
        repo.guardarMeta(nueva)
        emitir()
    }

    /** Número de día local, para calcular rachas y el reto diario. */
    private fun dia(t: Long) = (t + TimeZone.getDefault().getOffset(t)) / 86_400_000L

    private fun emitir() {
        val saldo = movs.sumOf { if (it.tipo == Tipo.INGRESO) it.monto else -it.monto }
        val progreso = if (meta.monto > 0) (saldo / meta.monto * 100).coerceIn(0.0, 100.0).toInt() else 0

        val dias = movs.map { dia(it.fecha) }.toSet()
        val hoy = dia(System.currentTimeMillis())
        var d = if (hoy in dias) hoy else hoy - 1
        var racha = 0
        while (d in dias) { racha++; d-- }

        _estado.value = Estado(
            saldo = saldo,
            meta = meta,
            progreso = progreso,
            nivel = 1 + movs.size / 5,
            racha = racha,
            retoHecho = hoy in dias,
            recientes = movs.sortedByDescending { it.fecha }.take(8)
        )
    }
}
