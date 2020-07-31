module.exports = (client) => {
  const ascii = require('ascii-table');
    

    client.awaitReply = async (message, question, limit = 60000) => {
        const filter = msg => msg.author.id = message.author.id;
        await message.channel.send(question);
        try {
            const collected = await message.channel.awaitMessages(filter, {
                max: 1,
                time: limit,
                errors: ['time']
            });
            return collected.first().content;
        } catch (e) {
            return;
        }
    };

    client.clean = async (client, text) => {
        if (text && text.constructor.name == 'Promise') text = await text;
        if (typeof evaled !== 'string') text = require('util').inspect(text, { depth: 1 });

        text = text
            .replace(/`/g, '`' + String.fromCharCode(8203))
            .replace(/@/g, '@' + String.fromCharCode(8203))
            .replace(client.token, 'mfa.VkO_2G4Qv3T--NO--lWetW_tjND--TOKEN--QFTm6YGtzq9PH--4U--tG0');

        return text;
    };
    const table = new ascii().setHeading("Nr.","Command", "Load Status");

    client.loadCommand = (cmdName,i) => {
            
        try {
            table.addRow(`${i}`,cmdName, 'Online');
            const props = require(`../commands/${cmdName}`);
            if (props.init) props.init(client);
            client.commands.set(props.help.name, props);
            props.help.aliases.forEach(alias => {
                client.aliases.set(alias, props.help.name);
            });
            return;
        } catch (err) {
            table.addRow(`${i}`,cmdName, 'Offline');
        }
        console.log(table.toString());
    };

    client.unloadCommand = async (cmdName) => {
        let cmd;
        if (client.commands.get(cmdName)) cmd = client.commands.get(cmdName);
        else if (client.aliases.has(cmdName)) cmd = client.commands.get(client.aliases.get(cmdName));
        
        if (!cmd) return `The command \`${cmdName}\` doesn't seem to exist.`;

        if (cmd.shutdown) await cmd.shutdown;
        const mod = require.cache[require.resolve(`../commands/${cmdName}`)];
        delete require.cache[require.resolve(`../commands/${cmdName}.js`)];
        for (let i = 0; i < mod.parent.children.length; i++) {
            mod.parent.children.splice(i, 1);
            break;
        }
        return;
    };

    String.prototype.toProperCase = function () {
        return this.replace(/([^\W_]+[^\s-]*) */g, function (txt) {return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
    };

    Array.prototype.random = function () {
        return this[Math.floor(Math.random() * this.length)];
    };

    client.wait = require('util').promisify(setTimeout);

    process.on('SIGTERM', async () => {
        await client.logger.log('SIGTERM signal received.');
        await client.logger.log('Botul se opreste...');
        await client.destroy(() => {
            client.logger.log('Botul s-a oprit.');
            process.exit(0);
        });
    });
    
    process.on('unhandledRejection', error => {
        client.logger.log(`Unhandled Rejection: ${error}`);
    });

};