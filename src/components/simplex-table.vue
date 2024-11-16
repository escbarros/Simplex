<template>
  <table id="formTable" style="width: 100%">
    <thead>
      <tr>
        <th class="operationsCol"></th>
        <th
          v-for="(_, index) of variableValuesHeader"
          class="variableCol"
          :number="index + 1"
        >
          X
        </th>
        <th class="bCol">≤</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(rest, restIndex) of restrictions" :key="restIndex">
        <td class="operationsCol" :number="restIndex + 1">F</td>
        <td v-for="(restValue, index) of rest" :key="index" class="variableCol">
          {{ restrictions[restIndex][index].toFixed(1) }}
        </td>
      </tr>
    </tbody>
    <tfoot>
      <tr>
        <th class="operationsCol">-Z</th>
        <th
          class="variableCol"
          v-for="(value, index) of variableValues"
          :key="index"
        >
          {{ value.toFixed(1) }}
        </th>
      </tr>
    </tfoot>
  </table>
</template>

<script>
export default {
  props: {
    table: {
      type: Array,
      required: true,
    },
  },

  computed: {
    variableValues() {
      const tableCopy = [...this.table];
      return tableCopy[tableCopy.length - 1];
    },
    variableValuesHeader() {
      const tableCopy = [...this.variableValues];
      tableCopy.pop();

      return tableCopy;
    },
    restrictions() {
      const tableCopy = [...this.table];
      tableCopy.pop();
      return tableCopy;
    },
  },
};
</script>
