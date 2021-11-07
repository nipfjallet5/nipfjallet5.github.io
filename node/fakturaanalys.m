close all
clear
clc

f = struct2table(struct2array(jsondecode(fileread('fakturor.json'))));

f.Lopnr = str2double(f.Lopnr);
f.Faktdat = datetime(f.Faktdat);
f.Forfaller = datetime(f.Forfaller);
f.Total = str2double(strrep(strrep(f.Total,' ',''),',','.'));
f.Saldo = str2double(strrep(strrep(f.Saldo,' ',''),',','.'));
f.Faktday = day(f.Faktdat,'dayofyear');

maskExclude = f.Lopnr==41 |  f.Lopnr==183 |  f.Lopnr==191 |  f.Lopnr==192 |  f.Lopnr==203 |  f.Lopnr==204;
f = f(~maskExclude,:);

mask2021 = f.Faktdat > datetime('2020-12-31');
mask2020 = f.Faktdat <= datetime('2020-12-31');
f2020 = sortrows(table2array(f(mask2020,[6,10])),2);
f2021 = sortrows(table2array(f(mask2021,[6,10])),2);

plot(f2020(:,2), cumsum(f2020(:,1))/1000, '-', 'linewidth', 2); hold on
plot(f2021(:,2), cumsum(f2021(:,1))/1000, '-', 'linewidth', 2);
plot([0,365], [797.4982,797.4982], 'k--', 'linewidth', 1); hold off
xlim([0,365]);
ylim([0,900]);
grid on
title('Fakturor')
xlabel('dag')
ylabel('summa (1000 kr)')

text(10, 840, 'intäkter 797498 kr/år (avgifter, bradband & parkering)')
legend('2020', '2021', 'Location', 'southeast')
