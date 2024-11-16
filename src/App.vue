<template>
  <main>
    <section id="form-container">
      <div id="objective">
        <h5>Funcao objetivo:</h5>
        <div class="objective-input-container">
          <span
            class="objective-function-variable-container"
            v-for="(_, index) of variableValues"
            :key="index"
          >
            <input
              type="number"
              :id="getInputId(index)"
              @change="objectiveInputChange($event, index)"
              @keydown="objectiveInputKeyDown($event, index)"
              :value="variableValues[index]"
            />
            <label
              :for="getInputId(index)"
              class="objective-variable-label"
              :number="index + 1"
              >x</label
            >
          </span>
        </div>
      </div>

      <section id="tableContainer">
        <table id="formTable">
          <thead>
            <tr>
              <th class="operationsCol"></th>
              <th
                v-for="(_, index) of variableValues"
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
              <td
                v-for="(restValue, index) of rest"
                :key="index"
                class="variableCol"
              >
                <input
                  class="restrictionInput"
                  type="number"
                  v-model="restrictions[restIndex][index]"
                />
              </td>

              <button
                v-if="restIndex >= 2"
                class="remove-restriction-button"
                @click="removeRestriction(restIndex)"
              >
                -
              </button>
              <button
                id="add-new-restriction-button"
                v-if="restIndex == restrictions.length - 1"
                @click="addRestriction"
              >
                + Adicionar restrição
              </button>
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
                {{ value }}
              </th>
              <th class="bCol">0</th>
            </tr>
          </tfoot>
        </table>
      </section>

      <section id="form-button-container">
        <button id="form-reset-button" @click="resetForm">Limpar</button>
        <button id="form-calculate-button" @click="calculate">Calcular</button>
      </section>
    </section>

    <section id="result-container">
      <span id="result-location-label" v-if="result.length == 0"
        ><h5>O resultado será exibido aqui</h5></span
      >
      <section id="result-table-container" v-else>
        <div class="iteration" v-for="(iteration, index) of result">
          <hr v-if="index > 0" />
          <h2 v-if="index > 0">Iteração {{ index }}</h2>
          <div class="step" v-for="(step, stepIndex) of iteration.steps">
            <h4>{{ step.label }}</h4>
            <simplex-table :table="step.table" />
          </div>
        </div>
      </section>
    </section>

    <button
      id="reset-body"
      v-if="result.length > 0"
      @click="resetForm"
    ></button>
    <footer>
      <code id="nomes">Feito por: André Schmidt e Eduardo Barros</code>
    </footer>
  </main>
</template>

<script>
import simplex from "./simplex.js";
import simplexTable from "./components/simplex-table.vue";
export default {
  components: {
    simplexTable,
  },
  data() {
    return {
      variableValues: [10, 12],
      restrictions: [
        [1, 1, 100],
        [1, 3, 270],
      ],

      result: [],
    };
  },

  methods: {
    getInputId(index) {
      return `objective-variable-${index}`;
    },
    objectiveInputKeyDown(event, index) {
      const value = event.target.value;
      if (event.key == "Tab" && index == this.variableValues.length - 1) {
        this.variableValues[index] = value;
        this.variableValues.push(0);

        let newList = [];
        for (let r of this.restrictions) {
          let newR = [];
          console.log(r.length);
          for (let i = 0; i < r.length; i++) {
            let val = r[i];
            if (i == r.length - 1) {
              newR.push(0);
            }
            newR.push(val);
          }
          newList.push(newR);
        }

        this.restrictions = newList;

        this.$nextTick(() => {
          this.focusInput(this.getInputId(index + 1));
        });
      } else if (event.key == "Backspace" && value == "") {
        if (this.variableValues.length == 2) {
          return;
        }
        this.variableValues.splice(index, 1);

        let newList = [];
        for (let r of this.restrictions) {
          let newR = [];
          for (let i = 0; i < r.length; i++) {
            if (i != index) {
              newR.push(r[i]);
            }
          }
          newList.push(newR);
        }

        this.restrictions = newList;
      }
    },

    focusInput(id) {
      const input = document.getElementById(this.getInputId(id));
      if (input) {
        input.focus();
      }
    },

    objectiveInputChange(event, index) {
      const value = event.target.value;
      if (value != "") {
        this.variableValues[index] = value;
      }
    },

    addRestriction() {
      const values = new Array(this.variableValues.length + 1).fill(0);
      this.restrictions.push(values);
    },
    removeRestriction(index) {
      this.restrictions.splice(index, 1);
    },

    resetForm() {
      this.variableValues = [0, 0];
      this.restrictions = [
        [0, 0, 0],
        [0, 0, 0],
      ];
      this.result = [];
    },

    calculate() {
      this.result = simplex(this.variableValues, this.restrictions);

      console.warn(this.result);
    },
  },
};
</script>
