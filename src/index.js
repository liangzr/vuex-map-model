/**
 * 配合 v-model 命令映射修改 Vuex
 * @param {Object} models mapModel 允许的 Model 类型
 * @example
 * computed: mapModel({
 *   extend: [$store.state.extend, 'updateExtend']
 * })
 */
export default function (models) {
  const { state } = store;
  if (!is.array(models) && !is.object(models)) {
    throw new Error('Incoming Parameter Invalid: mapModel only accepts arrays or objects');
  }
  if (is.array(models)) {
    models = models.reduce((convertedModels, model) => {
      if (!is.array(model)) {
        throw new Error('Structure Invalid: array models only accepts array item like [\'mappedKey\', \'mutationMethod\']');
      }
      convertedModels[model[0]] = [state[model[0]], model[1]];
      return convertedModels;
    }, {});
  }
  return Object.keys(models).reduce((mappedModels, key) => {
    const model = models[key];
    if (!is.array(model)) {
      throw new Error('Structure Invalid: array models only accepts array item like [\'mappedKey\', \'mutationMethod\']');
    }
    mappedModels[key] = {};
    if (is.object(model[0])) {
      const innerModels = {};
      for (const item in model[0]) {
        Object.defineProperty(innerModels, item, {
          get() {
            return findInObj(state, model[0])[item];
          },
          set(val) {
            store.commit(model[1], { [item]: val });
          },
          // Only enumerable properties can be serialized
          enumerable: true,
        });
      }
      mappedModels[key].get = function () {
        return innerModels;
      };
    } else {
      mappedModels[key].get = function () {
        return findInObj(state, model[0]);
      };
    }

    mappedModels[key].set = function (val) {
      store.commit(model[1], val);
    };

    return mappedModels;
  }, {});
}
