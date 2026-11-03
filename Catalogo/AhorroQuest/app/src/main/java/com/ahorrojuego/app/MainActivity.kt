package com.ahorrojuego.app

import android.os.Bundle
import android.widget.TextView
import android.widget.Toast
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import com.ahorrojuego.app.databinding.ActivityMainBinding
import com.ahorrojuego.app.databinding.DialogMetaBinding
import com.ahorrojuego.app.databinding.DialogMovimientoBinding
import com.google.android.material.color.MaterialColors
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import java.text.NumberFormat

class MainActivity : AppCompatActivity() {
    private lateinit var b: ActivityMainBinding
    private val vm: MainViewModel by viewModels()
    private val moneda = NumberFormat.getCurrencyInstance()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        b = ActivityMainBinding.inflate(layoutInflater)
        setContentView(b.root)

        b.fabAgregar.setOnClickListener { dialogoMovimiento() }
        b.btnMeta.setOnClickListener { dialogoMeta() }
        vm.estado.observe(this) { pintar(it) }
    }

    private fun pintar(e: Estado) {
        b.saldo.text = moneda.format(e.saldo)
        b.metaTitulo.text = "${e.meta.nombre}: ${moneda.format(e.meta.monto)}"
        b.progreso.setProgressCompat(e.progreso, true)
        b.porcentaje.text = "${e.progreso}% de la meta"
        b.nivel.text = "⭐ Nivel ${e.nivel}   ·   🔥 Racha: ${e.racha} día(s)"
        b.reto.text = if (e.retoHecho) "✅ Reto diario cumplido" else "🎯 Reto diario: registra un movimiento hoy"

        b.lista.removeAllViews()
        if (e.recientes.isEmpty()) {
            b.lista.addView(TextView(this).apply {
                text = "Aún no hay movimientos. ¡Registra el primero!"
                setPadding(0, 12, 0, 12)
            })
        }
        e.recientes.forEach { m ->
            val ingreso = m.tipo == Tipo.INGRESO
            val fila = TextView(this).apply {
                text = "${if (ingreso) "+" else "−"}${moneda.format(m.monto)}  ·  ${m.nota.ifBlank { "Sin nota" }}"
                textSize = 16f
                setPadding(0, 12, 0, 12)
                setTextColor(
                    MaterialColors.getColor(
                        this,
                        if (ingreso) com.google.android.material.R.attr.colorPrimary
                        else com.google.android.material.R.attr.colorError
                    )
                )
                setOnLongClickListener {
                    MaterialAlertDialogBuilder(this@MainActivity)
                        .setMessage("¿Eliminar este movimiento?")
                        .setPositiveButton("Eliminar") { _, _ -> vm.eliminar(m.id) }
                        .setNegativeButton("Cancelar", null)
                        .show()
                    true
                }
            }
            b.lista.addView(fila)
        }
    }

    private fun dialogoMovimiento() {
        val v = DialogMovimientoBinding.inflate(layoutInflater)
        v.tipo.check(R.id.btnGasto)
        MaterialAlertDialogBuilder(this)
            .setTitle("Nuevo movimiento")
            .setView(v.root)
            .setPositiveButton("Guardar") { _, _ ->
                val monto = v.etMonto.text.toString().replace(',', '.').toDoubleOrNull()
                if (monto == null || monto <= 0) {
                    Toast.makeText(this, "Escribe un monto válido", Toast.LENGTH_SHORT).show()
                    return@setPositiveButton
                }
                val tipo = if (v.tipo.checkedButtonId == R.id.btnIngreso) Tipo.INGRESO else Tipo.GASTO
                vm.agregar(tipo, monto, v.etNota.text.toString().trim())
            }
            .setNegativeButton("Cancelar", null)
            .show()
    }

    private fun dialogoMeta() {
        val v = DialogMetaBinding.inflate(layoutInflater)
        val actual = vm.estado.value?.meta
        v.etNombre.setText(actual?.nombre ?: "")
        v.etMetaMonto.setText(actual?.monto?.toString() ?: "")
        MaterialAlertDialogBuilder(this)
            .setTitle("Mi meta de ahorro")
            .setView(v.root)
            .setPositiveButton("Guardar") { _, _ ->
                val monto = v.etMetaMonto.text.toString().replace(',', '.').toDoubleOrNull()
                val nombre = v.etNombre.text.toString().trim().ifBlank { "Mi meta" }
                if (monto == null || monto <= 0) {
                    Toast.makeText(this, "Escribe un monto válido", Toast.LENGTH_SHORT).show()
                    return@setPositiveButton
                }
                vm.cambiarMeta(Meta(nombre, monto))
            }
            .setNegativeButton("Cancelar", null)
            .show()
    }
}
