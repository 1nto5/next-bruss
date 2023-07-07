import operators from '@/data/operators.json'

type Operator = {
  persNum: number
  name: string
}

const checkOperator = (persNum: number): Operator | null => {
  const operator = operators.find((operator) => operator.persNum === persNum)
  return operator || null
}

export default checkOperator
