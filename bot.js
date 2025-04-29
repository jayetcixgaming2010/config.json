const { 
    Client, 
    GatewayIntentBits, 
    SlashCommandBuilder, 
    Routes, 
    EmbedBuilder, 
    PermissionsBitField, 
    ChannelType 
} = require('discord.js');
const { REST } = require('@discordjs/rest');
const fs = require('fs');

// Đọc config.json
const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

// Đọc danh sách kênh đã track từ ID.txt
const trackedChannels = new Map();
if (fs.existsSync('./ID.txt')) {
    const data = fs.readFileSync('./ID.txt', 'utf8').split('\n');
    for (const line of data) {
        const [sourceId, targetId] = line.split('=>');
        if (sourceId && targetId) {
            trackedChannels.set(sourceId, targetId);
        }
    }
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Danh sách kênh sẽ được tạo
const notificationChannels = [
{ name: "⟡》『📊』𝐒𝐭𝐚𝐭𝐮𝐬" },
{ name: "⟡》『🍎』𝐒𝐭𝐨𝐜𝐤⟡𝐟𝐫𝐮𝐢𝐭" },
{ name: "⟡》『🌕』𝐅𝐮𝐥𝐥⟡𝐦𝐨𝐨𝐧" },
{ name: "⟡》『🌖』𝐍𝐞𝐚𝐫⟡𝐟𝐮𝐥𝐥⟡𝐦𝐨𝐨𝐧" },
{ name: "⟡》『🎨』𝐇𝐚𝐤𝐢⟡𝐂𝐨𝐥𝐨𝐫" },
{ name: "⟡》『⚔』𝐒𝐰𝐨𝐫𝐝⟡𝐋𝐞𝐠𝐞𝐧𝐝𝐚𝐫𝐲" },
{ name: "⟡》『🏝』𝐌𝐢𝐫𝐚𝐠𝐞⟡𝐈𝐬𝐥𝐚𝐧𝐝" },
{ name: "⟡》『🦊』𝐊𝐢𝐬𝐮𝐧𝐞⟡𝐈𝐬𝐥𝐚𝐧𝐝" },
{ name: "⟡》『🌋』𝐏𝐫𝐞𝐡𝐢𝐬𝐭𝐨𝐫𝐢𝐜⟡𝐈𝐬𝐥𝐚𝐧𝐝" },
{ name: "⟡》『👻』𝐒𝐨𝐮𝐥⟡𝐑𝐞𝐚𝐩𝐞𝐫" },
{ name: "⟡》『👹』𝐂𝐮𝐫𝐬𝐞𝐝⟡𝐂𝐚𝐩𝐭𝐚𝐢𝐧" },
{ name: "⟡》『⚓』𝐆𝐫𝐞𝐲⟡𝐁𝐫𝐞𝐚𝐫𝐝" },
{ name: "⟡》『👿』𝐃𝐫𝐚𝐤⟡𝐁𝐞𝐚𝐫𝐝" },
{ name: "⟡》『🍩』𝐃𝐨𝐮𝐠𝐡⟡𝐊𝐢𝐧𝐠" },
{ name: "⟡》『👑』𝐑𝐢𝐩⟡𝐈𝐧𝐝𝐫𝐚" },
{ name: "⟡》『🚶』𝐋𝐨𝐰⟡𝐒𝐞𝐯𝐞𝐫" },
{ name: "⟡》『🍊』𝐊𝐢𝐧𝐠⟡𝐋𝐞𝐠𝐚𝐜𝐲" }
];

// Định nghĩa lệnh Slash
const commands = [
    new SlashCommandBuilder()
        .setName('track')
        .setDescription('Theo dõi tin nhắn từ một kênh và sao chép vào kênh khác')
        .addStringOption(option =>
            option.setName('source')
                .setDescription('ID kênh nguồn')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('target')
                .setDescription('ID kênh đích')
                .setRequired(true)),
    new SlashCommandBuilder()
        .setName('untrack')
        .setDescription('Dừng theo dõi tin nhắn từ một kênh')
        .addStringOption(option =>
            option.setName('source')
                .setDescription('ID kênh nguồn')
                .setRequired(true)),
    new SlashCommandBuilder()
        .setName('creatnotifichannel')
        .setDescription('Tạo kênh thông báo trong danh mục được chọn')
        .addChannelOption(option =>
            option.setName('category')
                .setDescription('Chọn danh mục để tạo kênh')
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildCategory)) // Chỉ cho phép chọn danh mục
].map(command => command.toJSON());

// Đăng ký lệnh Slash
const rest = new REST({ version: '10' }).setToken(config.token);
rest.put(Routes.applicationCommands(config.clientId), { body: commands })
    .then(() => console.log('✅ Đã đăng ký lệnh slash trên tất cả server.'))
    .catch(console.error);

client.once('ready', () => {
    console.log(`🚀 Bot đã đăng nhập với tên: ${client.user.tag}`);

   
 client.user.setPresence({
        activities: [
            {
                name: "CHO THUÊ NOTIFI GIÁ RẺ 20K",
                type: "listening"  // Hoặc "WATCHING", "LISTENING", "STREAMING" tùy theo nhu cầu
            }
        ],
        status: 'online' // Hoặc online 'dnd', 'idle', 'invisible'
    });
});

// Xử lý lệnh Slash
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    // Chỉ Owner mới có quyền dùng lệnh
    if (interaction.user.id !== config.ownerId) {
        return interaction.reply({ content: '❌ Bạn không có quyền sử dụng lệnh này!', ephemeral: true });
    }

    if (interaction.commandName === 'track') {
        const sourceId = interaction.options.getString('source');
        const targetId = interaction.options.getString('target');

        const targetChannel = await client.channels.fetch(targetId).catch(() => null);
        if (!targetChannel) {
            return interaction.reply({ content: '❌ Kênh đích không tồn tại!', ephemeral: true });
        }

        trackedChannels.set(sourceId, targetId);

        // Lưu vào file ID.txt
        fs.appendFileSync('./ID.txt', `${sourceId}=>${targetId}\n`);
        
        return interaction.reply(`✅ Đang sao chép tin nhắn từ kênh <#${sourceId}> sang <#${targetId}>`);
    }

    if (interaction.commandName === 'untrack') {
        const sourceId = interaction.options.getString('source');

        if (trackedChannels.has(sourceId)) {
            trackedChannels.delete(sourceId);

            // Cập nhật lại file ID.txt
            const newData = Array.from(trackedChannels.entries()).map(([s, t]) => `${s}=>${t}`).join('\n');
            fs.writeFileSync('./ID.txt', newData);

            return interaction.reply(`✅ Đã dừng sao chép tin nhắn từ kênh <#${sourceId}>`);
        } else {
            return interaction.reply({ content: '⚠ Kênh này chưa được theo dõi.', ephemeral: true });
        }
    }

    if (interaction.commandName === 'creatnotifichannel') {
        const categoryChannel = interaction.options.getChannel('category');
        const guild = interaction.guild;

        if (!categoryChannel || categoryChannel.type !== ChannelType.GuildCategory) {
            return interaction.reply({ content: '❌ Danh mục không hợp lệ hoặc không tồn tại!', ephemeral: true });
        }

        // Phản hồi ngay cho người dùng để tránh lỗi "Unknown Interaction"
        await interaction.reply({ content: '⏳ Đang tạo các kênh thông báo...', ephemeral: true });

        let createdChannels = [];

        for (const channelData of notificationChannels) {
            const newChannel = await guild.channels.create({
                name: channelData.name,
                type: ChannelType.GuildText,
                parent: categoryChannel.id,
                permissionOverwrites: [
                    {
                        id: guild.id, // Everyone
                        deny: [PermissionsBitField.Flags.SendMessages], // Chặn gửi tin nhắn
                        allow: [PermissionsBitField.Flags.ViewChannel] // Vẫn có thể xem
                    }
                ]
            });
            createdChannels.push(`<#${newChannel.id}>`);
        }

        return interaction.followUp(`✅ Đã tạo các kênh thông báo trong danh mục <#${categoryChannel.id}>:\n${createdChannels.join("\n")}`);
    }
});

// Sao chép tin nhắn từ kênh nguồn và gửi vào kênh đích
client.on('messageCreate', async message => {
    // Kiểm tra nếu kênh có trong danh sách theo dõi
    const targetChannelId = trackedChannels.get(message.channel.id);
    if (!targetChannelId) return;

    const targetChannel = await client.channels.fetch(targetChannelId).catch(() => null);
    if (!targetChannel) return;

    // Sao chép và chỉnh sửa embed
    const embeds = message.embeds.map(embed => {
        return new EmbedBuilder(embed.toJSON())
            .setTitle('Notifi Blox Fruit [ 🎮 ] ℍ𝕒𝕙𝕒 𝔾𝕒𝕞𝕖𝕣 ℍ𝕦𝕓')
            .setAuthor({ name: "NOTIFY SIÊU VIP PRO", iconURL: "https://media.discordapp.net/attachments/1366375461005037599/1366540680427470889/image.png?ex=681151af&is=6810002f&hm=3cf07ea9cedc6faa7016981114d0596fd7cace50f3e1380686ef69f70d3b12a8&=&format=webp&quality=lossless&width=581&height=581", url: "https://discord.gg/H3u2H2B7aM" })
            .setImage("")
            .setThumbnail("https://media.discordapp.net/attachments/1363541797879550117/1366748158876713031/Screenshot_20250402-0608392.png?ex=681212ea&is=6810c16a&hm=edd8319efeae9f7d88ebd1ced29fc34df888e62ef0992b7c2badb7f27ebf1982&=&format=webp&quality=lossless&width=499&height=748")
            .setColor('#f2f7f7')
            .setFooter({ text: 'Made by Kiên | https://discord.gg/e6yjqPzWqT ', iconURL: 'https://media.discordapp.net/attachments/1366375461005037599/1366540680427470889/image.png?ex=681151af&is=6810002f&hm=3cf07ea9cedc6faa7016981114d0596fd7cace50f3e1380686ef69f70d3b12a8&=&format=webp&quality=lossless&width=581&height=581' });
    });

    targetChannel.send({
        content: message.content || '',
        embeds: embeds,
        files: message.attachments.size > 0 ? message.attachments.map(a => a.url) : []
    }).catch(console.error);
});

client.login(config.token);
