import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const categories = [
  { name: 'Alimentação', icon: '🍔' },
  { name: 'Mercado', icon: '🛒' },
  { name: 'Transporte', icon: '🚗' },
  { name: 'Casa', icon: '🏠' },
  { name: 'Saúde', icon: '💊' },
  { name: 'Lazer', icon: '🎮' },
  { name: 'Compras', icon: '🛍️' },
  { name: 'Assinaturas', icon: '💳' },
  { name: 'Contas', icon: '🧾' },
  { name: 'Outros', icon: '📦' },
];

async function seedCategories() {
  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: { icon: category.icon },
      create: category,
    });
  }
  console.log(`Categorias: ${categories.length} garantidas.`);
}

async function seedUser() {
  const { SEED_USER_NAME, SEED_USER_EMAIL, SEED_USER_PASSWORD } = process.env;

  if (!SEED_USER_NAME || !SEED_USER_EMAIL || !SEED_USER_PASSWORD) {
    console.log('Usuário inicial: variáveis SEED_USER_* não definidas, etapa ignorada.');
    return;
  }

  const email = SEED_USER_EMAIL.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Usuário inicial: ${email} já existe, nada alterado.`);
    return;
  }

  const passwordHash = await bcrypt.hash(SEED_USER_PASSWORD, 12);
  await prisma.user.create({
    data: { name: SEED_USER_NAME.trim(), email, passwordHash },
  });
  console.log(`Usuário inicial: ${email} criado.`);
}

try {
  await seedCategories();
  await seedUser();
} catch (error) {
  console.error('Falha no seed:', error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
