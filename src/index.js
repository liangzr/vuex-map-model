import { should, isPlainObject, isArray } from './util'

export default function (models) {
  should(isArray(models) || isPlainObject(models), 'only accepts array or object')

  const _models = normalizeModels(models)

  return Object.keys(_models).reduce((mappedModels, key) => {
    const [fieldPath, mutationType, spread] = _models[key]
    mappedModels[key] = Object.create(null)

    mappedModels[key].get = function () {
      return resolveField(this.$store.state, fieldPath)
    }

    mappedModels[key].set = function (val) {
      const payload = spread ? { [key]: val } : val
      this.$store.commit(mutationType, payload)
    }

    return mappedModels
  }, Object.create(null))
}

/**
 * Take field name from field path
 */
function getFieldName (path) {
  const fields = path.split('.')
  return fields[fields.length - 1]
}
/**
 * Take field by chain of properties from object
 */
function resolveField (state, path) {
  return path.split('.').reduce((r, key) => r[key], state)
}

/**
 * Normalize the array expression
 */
function normalizeModels (models) {
  if (isArray(models)) {
    return models.reduce((convertedModels, model) => {
      const rawModel = normalizeModel(model)
      for (const index in rawModel) {
        const [key, path, mutationType, spread] = rawModel[index]
        convertedModels[key] = [path, mutationType, spread]
      }
      return convertedModels
    }, Object.create(null))
  }
  return models
}

/**
 * Normalize the model form different expression
 * @param {Array} model
 * -- [fieldPath, mutaionType]
 * -- [fieldPath, mutaionType, [field1, field2, field3...]]
 * -- [fieldPath, mutaionType, field1, field2, field3...]
 * @returns [[key, fieldPath, mutationType]]
 */
function normalizeModel (model) {
  should(model.length > 1, 'the length of the model expression must greater than 1')
  should(isArray(model), 'model expression must be array')

  const fieldPath = model[0]
  const mutaionType = model[1]
  const rootKey = getFieldName(fieldPath)

  if (model.length > 2) {
    let submodels = isArray(model[2]) ? model[2] : [model[2]]
    if (model.length > 3) {
      submodels = model.slice(2)
    }
    return submodels
      .map(key => ([key, `${fieldPath}.${key}`, mutaionType, true]))
      .concat([[rootKey, fieldPath, mutaionType, false]])
  }
  return [[rootKey, ...model]]
}
