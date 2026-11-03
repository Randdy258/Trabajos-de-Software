package com.ahorrojuego.app

enum class Tipo { INGRESO, GASTO }

data class Movimiento(
    val id: Long,
    val tipo: Tipo,
    val monto: Double,
    val nota: String,
    val fecha: Long
)

data class Meta(val nombre: String, val monto: Double)

/** Todo lo que la pantalla necesita pintar, calculado en un solo lugar. */
data class Estado(
    val saldo: Double,
    val meta: Meta,
    val progreso: Int,
    val nivel: Int,
    val racha: Int,
    val retoHecho: Boolean,
    val recientes: List<Movimiento>
)
