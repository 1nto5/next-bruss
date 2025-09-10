// FORD DATE VALIDATION
export const fordValidation = (dmc: string) => {
  const today = new Date()
  const year = today.getFullYear()
  const start = new Date(year, 0, 0)
  const diff = today.getTime() - start.getTime()
  const oneDay = 1000 * 60 * 60 * 24
  const dotyGreg = Math.floor(diff / oneDay)
  const dotyJul = dotyGreg > 13 ? dotyGreg - 13 : 365 - 13 + dotyGreg
  const dmcDotyJul = parseInt(dmc.substr(7, 3))
  return (
    dmcDotyJul === dotyJul ||
    dmcDotyJul === dotyJul - 1 ||
    dmcDotyJul === dotyJul - 2
  )
}

// BMW DATE VALIDATION
export function bmwValidation(dmc: string) {
  const todayDate = parseInt(
    new Date().toISOString().slice(2, 10).split('-').join('')
  )
  const tomorrowDate = parseInt(
    new Date(new Date().getTime() + 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(2, 10)
      .split('-')
      .join('')
  )
  const yesterdayDate = parseInt(
    new Date(new Date().getTime() - 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(2, 10)
      .split('-')
      .join('')
  )
  const dayBeforeYesterdayDate = parseInt(
    new Date(new Date().getTime() - 48 * 60 * 60 * 1000)
      .toISOString()
      .slice(2, 10)
      .split('-')
      .join('')
  )
  const dmcDate = parseInt(dmc.slice(17, 23))
  return (
    dmcDate === todayDate ||
    dmcDate === tomorrowDate ||
    dmcDate === yesterdayDate ||
    dmcDate === dayBeforeYesterdayDate
  )
}
