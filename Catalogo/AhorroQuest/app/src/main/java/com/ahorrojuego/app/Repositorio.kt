package com.ahorrojuego.app

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject

/** Persistencia local ligera con SharedPreferences (JSON, sin dependencias extra). */
class Repositorio(context: Context) {
    private val prefs = context.getSharedPreferences("ahorro_prefs", Context.MODE_PRIVATE)

    fun movimientos(): List<Movimiento> {
        val arr = JSONArray(prefs.getString("movs", "[]"))
        return (0 until arr.length()).map {
            val o = arr.getJSONObject(it)
            Movimiento(
                o.getLong("id"), Tipo.valueOf(o.getString("tipo")),
                o.getDouble("monto"), o.getString("nota"), o.getLong("fecha")
            )
        }
    }

    fun guardarMovimientos(lista: List<Movimiento>) {
        val arr = JSONArray()
        lista.forEach {
            arr.put(
                JSONObject().put("id", it.id).put("tipo", it.tipo.name)
                    .put("monto", it.monto).put("nota", it.nota).put("fecha", it.fecha)
            )
        }
        prefs.edit().putString("movs", arr.toString()).apply()
    }

    fun meta() = Meta(
        prefs.getString("meta_nombre", "Mi primera meta")!!,
        prefs.getString("meta_monto", "1000")!!.toDouble()
    )

    fun guardarMeta(m: Meta) {
        prefs.edit().putString("meta_nombre", m.nombre)
            .putString("meta_monto", m.monto.toString()).apply()
    }
}
