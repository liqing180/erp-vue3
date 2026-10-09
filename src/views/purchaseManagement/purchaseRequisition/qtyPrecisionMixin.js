export default {
  methods: {
    updateQtyPrecision(row, selectedUnit) {
      if (!selectedUnit) return

      const oldPrecision = row.decimalPrecision
      const { decimalPrecision, unitRoundingType } = selectedUnit
      row.decimalPrecision = decimalPrecision
      row.unitRoundingType = unitRoundingType
      if (
        row.qty !== undefined &&
        row.qty !== null &&
        row.qty !== '' &&
        decimalPrecision < oldPrecision
      ) {
        const quantity = this.$num(row.qty, {
          precision: decimalPrecision,
          roundingType: unitRoundingType
        })
        row.qty = Math.max(this.$getMinNum(decimalPrecision), quantity)
      }
    }
  }
}
