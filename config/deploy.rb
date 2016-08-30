require 'mina/rsync'

set :user, 'root'
set :domain, ENV['DOMAIN'] || 'foobar.com'
set :deploy_to, '/var/www/angular'
set :branch, 'master'
set :rsync_options, %w[--recursive --delete --delete-excluded --exclude .git* --exclude deploy.rb]
set :rsync_stage, "deploy"
set :forward_agent, true

desc 'Deploy to server'
task :deploy do
  deploy do
    invoke 'rsync:deploy'
    invoke :'deploy:cleanup'
    to :launch do
       queue %[ mkdir -p #{deploy_to}/current/bridges/php/temp ]
       queue %[ chown -R angular:angular #{deploy_to} ]
       queue %[ chown -R angular:apache #{deploy_to}/current/bridges/php/temp ]
    end
  end
end

task :precompile do
  Dir.chdir "#{settings.rsync_stage}/bridges/php" do
    system '/usr/local/bin/composer install --no-dev'
  end
end
