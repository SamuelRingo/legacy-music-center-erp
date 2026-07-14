import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ==================== STUDENTS ====================

export const getStudentDetail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const student = await prisma.user.findFirst({
      where: { id, role: 'STUDENT' },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        studentProfile: {
          include: {
            enrollments: {
              include: {
                schedule: {
                  include: {
                    course: true,
                    teacher: { select: { name: true } },
                    classroom: true
                  }
                },
                finalGrades: true
              }
            },
            achievements: {
              orderBy: { date: 'desc' }
            }
          }
        }
      }
    });

    if (!student) {
      return res.status(404).json({ message: 'Siswa tidak ditemukan' });
    }
    res.json(student);
  } catch (error) {
    next(error);
  }
};

// ==================== TRANSACTIONS ====================

export const getTransactions = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    
    let where = {};
    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
      where = {
        date: {
          gte: startDate,
          lte: endDate
        }
      };
    }

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { date: 'desc' }
    });
    res.json(transactions);
  } catch (error) {
    next(error);
  }
};

export const createTransaction = async (req, res, next) => {
  try {
    const { type, amount, category, description, date } = req.body;
    
    if (!type || !amount || !category) {
      return res.status(400).json({ message: 'Type, amount, dan category harus diisi' });
    }

    const transaction = await prisma.transaction.create({
      data: {
        type,
        amount: parseFloat(amount),
        category,
        description,
        date: date ? new Date(date) : new Date()
      }
    });
    res.status(201).json(transaction);
  } catch (error) {
    next(error);
  }
};

// ==================== INVENTORY ====================

export const getInventory = async (req, res, next) => {
  try {
    const inventory = await prisma.inventoryItem.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(inventory);
  } catch (error) {
    next(error);
  }
};

export const createInventoryItem = async (req, res, next) => {
  try {
    const { name, category, status, quantity, description } = req.body;
    
    if (!name || !category || !status) {
      return res.status(400).json({ message: 'Name, category, dan status harus diisi' });
    }

    const item = await prisma.inventoryItem.create({
      data: {
        name,
        category,
        status,
        quantity: quantity ? parseInt(quantity) : 1,
        description
      }
    });
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
};

export const updateInventoryItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, category, status, quantity, description } = req.body;
    
    const item = await prisma.inventoryItem.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(category && { category }),
        ...(status && { status }),
        ...(quantity !== undefined && { quantity: parseInt(quantity) }),
        ...(description !== undefined && { description })
      }
    });
    res.json(item);
  } catch (error) {
    next(error);
  }
};
