import prisma from '../prisma'

export const createUser = async (address: string) => {
  const user = await prisma.user.create({
    data: {
      address,
      agentAddress: '',
      agentSystemPrompt: '',
    },
  })
  return user
}

export const getUserByAddress = async (address: string) => {
  const user = await prisma.user.findUnique({
    where: { address },
  })
  return user
}

export const getUserById = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
  })
  return user
}

export const updateAgentInfo = async (
  userId: string,
  agentAddress: string,
  agentSystemPrompt: string
) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { agentAddress, agentSystemPrompt },
  })
  return user
}
