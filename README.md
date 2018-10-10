vuex-map-model
===
More elegant one-way data flow using Vuex with v-model command

## Install

npm:

```js
npm install --save vuex-map-model
```

or yarn:

```js
yarn add vuex-map-model
```

## Usage

### Basic example

Typically, you can simply import `vuex-map-model` into the component and add mutaion function to the corresponding store.

#### Component

```html
<template>
  <div id="search">
    <input v-model="carStatus">
  </div>
</template>

<script>
import mapModel from 'vuex-map-model';

export default {
  computed: {
    // The `mapModel` function takes an plain object of `model expression` and
    // generates corresponding computed properties with getter and
    // setter functions for accessing the Vuex store.
    ...mapModel({
      carUniqueMapped: ['cars.serach', 'cars/updateCarUnique'],
    })
  },
};
</script>
```

#### Store

@/store/module/cars:
```js
export default {
  namespaced: true,
  state: {
    carUnique: '',
  },
  mutations: {
    // Once the `this.carUnique` or `this.search` changed, `vuex-map-model` will
    // commit a payload to the Vuex store
    //
    // @example
    // <= this.carUnique = 'TRS012333G7'
    // => payload: 'TRS012333G7'
    updateCarUnique (state, payload) {
      state.carUnique = payload
    },
  },
  actions: {...}
}
```

### Nested fields

In some cases, you need to define multiple fields at the similar situation, such as the query boxes for the list, then you can use arrays to merge updates for fields quickly.

#### Component

```html
<template>
  <div id="search">
    <input v-model="carUnique">
    <input v-model="carStatus">
  </div>
</template>

<script>
import mapModel from 'vuex-map-model';

export default {
  computed: {
    // The `mapModel` function takes an array of `model expression`
    // different than before.
    //
    // The following expression are supported:
    // Expression A: [fieldPath, fieldA, fieldB..., mutationType]
    // Expression B: [fieldPath, [fieldA, fieldB...], mutationType]
    // => this.fieldA, this.fieldB, this.search
    ...mapModel([
      ['cars.search', 'carUnique', 'carStatus', 'cars/updateSearch'],
      // or ['cars.search', ['carUnique', 'carStatus'], 'cars/updateSearch'],
      // or ['car.search.carUnique', 'cars/updateCarUnique']
      //  + ['car.search.carStatus', 'cars/updateCarStatus']
    ]),
  },
};
</script>
```

#### Store

@/store/module/cars:
```js
const initState = () => ({
  search: {
    carUnique: '',
    carStatus: '',
  },
  loading: false,
  ...
})

export default {
  namespaced: true,
  state: initState(),
  mutations: {
    // Once the `this.carUnique` or `this.search` changed, `vuex-map-model` will
    // commit a payload to the Vuex store
    //
    // @example
    // <= this.carUnique = 'TRS012333G7'
    // => payload: { carUnique: 'TRS012333G7' }
    // <= this.search = { carStatus: 2 }
    // => payload: { carStatus: 2 }
    updateSearch (state, payload) {
      Object.assign(state.search, payload)
    },
    resetSearch (state) {
      state.search = initState().search
    },
  },
  actions: {...}
}
```

## Attention

We strongly oppose the use in places where there is no v-model, please reference [Two-way Computed Property](https://vuex.vuejs.org/guide/forms.html#two-way-computed-property)

## License

MIT