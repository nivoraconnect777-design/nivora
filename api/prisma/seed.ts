import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create sample users
  const hashedPassword = await bcrypt.hash('Password123', 10);

  const user1 = await prisma.user.create({
    data: {
      username: 'john_doe',
      email: 'john@example.com',
      password: hashedPassword,
      displayName: 'John Doe',
      bio: 'Software developer and photography enthusiast 📸',
      profilePicUrl: 'https://i.pravatar.cc/150?img=1',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      username: 'jane_smith',
      email: 'jane@example.com',
      password: hashedPassword,
      displayName: 'Jane Smith',
      bio: 'Travel blogger | Adventure seeker 🌍',
      profilePicUrl: 'https://i.pravatar.cc/150?img=2',
    },
  });

  const user3 = await prisma.user.create({
    data: {
      username: 'mike_wilson',
      email: 'mike@example.com',
      password: hashedPassword,
      displayName: 'Mike Wilson',
      bio: 'Fitness coach | Healthy lifestyle 💪',
      profilePicUrl: 'https://i.pravatar.cc/150?img=3',
    },
  });

  console.log('✅ Created 3 sample users');

  // Create follow relationships
  await prisma.follow.create({
    data: {
      followerId: user1.id,
      followingId: user2.id,
    },
  });

  await prisma.follow.create({
    data: {
      followerId: user1.id,
      followingId: user3.id,
    },
  });

  await prisma.follow.create({
    data: {
      followerId: user2.id,
      followingId: user1.id,
    },
  });

  console.log('✅ Created follow relationships');

  // Create sample posts
  const post1 = await prisma.post.create({
    data: {
      userId: user1.id,
      mediaUrl: 'https://picsum.photos/800/800?random=1',
      mediaType: 'image',
      thumbnailUrl: 'https://picsum.photos/320/320?random=1',
      caption: 'Beautiful sunset at the beach 🌅',
    },
  });

  const post2 = await prisma.post.create({
    data: {
      userId: user2.id,
      mediaUrl: 'https://picsum.photos/800/800?random=2',
      mediaType: 'image',
      thumbnailUrl: 'https://picsum.photos/320/320?random=2',
      caption: 'Exploring new places! #travel',
    },
  });

  console.log('✅ Created 2 sample posts');

  // Create sample likes
  await prisma.like.create({
    data: {
      userId: user2.id,
      postId: post1.id,
    },
  });

  await prisma.like.create({
    data: {
      userId: user3.id,
      postId: post1.id,
    },
  });

  console.log('✅ Created sample likes');

  // Create sample comments
  await prisma.comment.create({
    data: {
      userId: user2.id,
      postId: post1.id,
      text: 'Amazing photo! 😍',
    },
  });

  await prisma.comment.create({
    data: {
      userId: user3.id,
      postId: post1.id,
      text: 'Love this!',
    },
  });

  console.log('✅ Created sample comments');

  // Create sample story
  await prisma.story.create({
    data: {
      userId: user1.id,
      mediaUrl: 'https://picsum.photos/1080/1920?random=10',
      mediaType: 'image',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    },
  });

  console.log('✅ Created sample story');

  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
