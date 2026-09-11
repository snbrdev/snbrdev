"""
Calculadora de costos - Eleven Center
Productos importados desde Zappy Paraguay.

Flujo de costos:
  1. Costo proveedor: lo que Zappy Paraguay cobra por el producto
     (puede venir en USD, se convierte a Gs con el tipo de cambio).
  2. Costo de venta: precio al que Eleven Center vende el producto,
     aplicando un margen de ganancia sobre el costo proveedor.
  3. Delivery: costo de entrega al cliente final.
  4. Costo final: lo que paga el cliente (costo de venta + delivery).
"""

import csv
import os
from dataclasses import dataclass

ARCHIVO_HISTORIAL = os.path.join(os.path.dirname(__file__), "historial_costos.csv")


@dataclass
class ResultadoCosto:
    producto: str
    costo_proveedor_gs: float
    margen_pct: float
    precio_venta_gs: float
    delivery_gs: float
    costo_final_gs: float
    ganancia_gs: float


def calcular_costo_proveedor(costo_producto: float, moneda: str, tipo_cambio: float = 1) -> float:
    """Convierte el costo cobrado por Zappy Paraguay a guaraníes."""
    if moneda.upper() == "USD":
        return costo_producto * tipo_cambio
    return costo_producto


def calcular_precio_venta(costo_proveedor_gs: float, margen_pct: float) -> float:
    """Precio de venta aplicando el margen de ganancia sobre el costo proveedor."""
    return costo_proveedor_gs * (1 + margen_pct / 100)


def calcular_costo_final(precio_venta_gs: float, delivery_gs: float) -> float:
    """Total que paga el cliente: precio de venta + delivery."""
    return precio_venta_gs + delivery_gs


def calcular_todo(producto: str, costo_producto: float, moneda: str, tipo_cambio: float,
                   margen_pct: float, delivery_gs: float) -> ResultadoCosto:
    costo_proveedor_gs = calcular_costo_proveedor(costo_producto, moneda, tipo_cambio)
    precio_venta_gs = calcular_precio_venta(costo_proveedor_gs, margen_pct)
    costo_final_gs = calcular_costo_final(precio_venta_gs, delivery_gs)
    ganancia_gs = precio_venta_gs - costo_proveedor_gs

    return ResultadoCosto(
        producto=producto,
        costo_proveedor_gs=costo_proveedor_gs,
        margen_pct=margen_pct,
        precio_venta_gs=precio_venta_gs,
        delivery_gs=delivery_gs,
        costo_final_gs=costo_final_gs,
        ganancia_gs=ganancia_gs,
    )


def formatear_gs(valor: float) -> str:
    return f"Gs. {valor:,.0f}".replace(",", ".")


def mostrar_resultado(r: ResultadoCosto) -> None:
    print("\n" + "=" * 40)
    print(f"Producto:          {r.producto}")
    print(f"Costo proveedor:   {formatear_gs(r.costo_proveedor_gs)}")
    print(f"Margen aplicado:   {r.margen_pct}%")
    print(f"Costo de venta:    {formatear_gs(r.precio_venta_gs)}")
    print(f"Delivery:          {formatear_gs(r.delivery_gs)}")
    print(f"Costo final:       {formatear_gs(r.costo_final_gs)}")
    print(f"Ganancia:          {formatear_gs(r.ganancia_gs)}")
    print("=" * 40)


def guardar_en_historial(r: ResultadoCosto) -> None:
    existe = os.path.isfile(ARCHIVO_HISTORIAL)
    with open(ARCHIVO_HISTORIAL, "a", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        if not existe:
            writer.writerow([
                "producto", "costo_proveedor_gs", "margen_pct",
                "precio_venta_gs", "delivery_gs", "costo_final_gs", "ganancia_gs",
            ])
        writer.writerow([
            r.producto, round(r.costo_proveedor_gs), r.margen_pct,
            round(r.precio_venta_gs), round(r.delivery_gs),
            round(r.costo_final_gs), round(r.ganancia_gs),
        ])


def pedir_float(mensaje: str) -> float:
    while True:
        try:
            return float(input(mensaje).strip().replace(",", "."))
        except ValueError:
            print("Ingresá un número válido.")


def main() -> None:
    print("Calculadora de costos - Eleven Center (productos Zappy Paraguay)")

    while True:
        producto = input("\nNombre del producto: ").strip()

        moneda = input("Moneda del costo proveedor (USD/GS): ").strip().upper()
        while moneda not in ("USD", "GS"):
            moneda = input("Ingresá USD o GS: ").strip().upper()

        costo_producto = pedir_float("Costo cobrado por Zappy Paraguay: ")

        tipo_cambio = 1.0
        if moneda == "USD":
            tipo_cambio = pedir_float("Tipo de cambio (Gs por USD): ")

        margen_pct = pedir_float("Margen de ganancia deseado (%): ")
        delivery_gs = pedir_float("Costo de delivery (Gs): ")

        resultado = calcular_todo(producto, costo_producto, moneda, tipo_cambio, margen_pct, delivery_gs)
        mostrar_resultado(resultado)

        if input("\n¿Guardar en historial? (s/n): ").strip().lower() == "s":
            guardar_en_historial(resultado)
            print(f"Guardado en {ARCHIVO_HISTORIAL}")

        if input("¿Calcular otro producto? (s/n): ").strip().lower() != "s":
            break


if __name__ == "__main__":
    main()
