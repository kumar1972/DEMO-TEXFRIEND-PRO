function translateColorToTamil(colorName) {
    if (!colorName) return '-';
    var original = colorName.trim();
    var c = original.toLowerCase();

    // 📌 விரிவுபடுத்தப்பட்ட நிறங்கள் அகராதி (Extended Dictionary)
    var map = {
        'gold': 'கோல்டு',
        'l. olive': 'L. ஆலிவ்',
        'd. olive': 'D. ஆலிவ்',
        'grey': 'கிரே',
        'gray': 'கிரே',
        't.salavai': 'T. சலவை',
        't. salavai': 'T. சலவை',
        't. white': 'T. சலவை',
        '1/2 salavai': '1/2 சலவை',
        '1/2 white': '1/2 சலவை',
        'white': 'வெள்ளை',
        'black': 'கருப்பு',
        'blue': 'ப்ளூ',
        'yellow': 'மஞ்சள்',
        'red': 'ரெட்',
        'green': 'கிரீன்',
        'p. green': 'கிளி பச்சை',
        'brown': 'பிரவுன்',
        'khaki': 'காக்கி',
        'l. khaki': 'L. காக்கி',
        'd. khaki': 'D. காக்கி',
        'rose': 'ரோஸ்',
        'orange': 'ஆரஞ்சு',
        'violet': 'வைலட்',
        'pink': 'பிங்க்',
        'navy': 'நேவி',
        'l. navy': 'L. நேவி',
        'd. navy': 'D. நேவி',
        'maroon': 'மெரூன்',
        'olive': 'ஆலிவ்',
        'l. blue': 'L. ப்ளூ',
        'r. blue': 'R. ப்ளூ',
        'turq': 'டர்க்',
        'purple': 'பர்புள்',
        'cream': 'கிரீம்',
        'beige': 'பேஜ்',
        'biscuit': 'பிஸ்கட்',
        'majenda': 'மெஜந்தா',
        'silver': 'சில்வர்',
        'peach': 'பீச்',
        'sky blue': 'வான ப்ளூ',
        'bottle green': 'பாட்டில் கிரீன்',
        'onion': 'ஆனியன்'
    };

    if (map[c]) return map[c];

    // Regex மூலம் இன்னும் எளிதாக மாற்றலாம்
    let translated = original;
    
    // Prefix மாற்றுதல்
    translated = translated.replace(/^t\.\s*/i, 'T. ')
                           .replace(/^l\.\s*/i, 'L. ')
                           .replace(/^d\.\s*/i, 'D. ')
                           .replace(/^r\.\s*/i, 'R. ')
                           .replace(/^p\.\s*/i, 'P. ');

    // பொதுவான நிறங்களை மாற்றுதல்
    let colorMap = {
        'gold': 'கோல்டு', 'grey': 'கிரே', 'gray': 'கிரே', 'salavai': 'சலவை',
        'white': 'வெள்ளை', 'black': 'கருப்பு', 'blue': 'ப்ளூ', 'yellow': 'மஞ்சள்',
        'red': 'ரெட்', 'green': 'கிரீன்', 'brown': 'பிரவுன்', 'khaki': 'காக்கி',
        'rose': 'ரோஸ்', 'orange': 'ஆரஞ்சு', 'pink': 'பிங்க்', 'maroon': 'மெரூன்',
        'olive': 'ஆலிவ்', 'purple': 'பர்புள்', 'cream': 'கிரீம்', 'beige': 'பேஜ்',
        'biscuit': 'பிஸ்கட்', 'majenda': 'மெஜந்தா', 'navy': 'நேவி'
    };

    for (let key in colorMap) {
        let regex = new RegExp(key, 'gi');
        translated = translated.replace(regex, colorMap[key]);
    }

    return translated;
}
